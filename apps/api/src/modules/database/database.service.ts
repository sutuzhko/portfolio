import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Article, type Folder, Prisma } from '@prisma/client';

import { localize } from '../../common/i18n/localize';
import type { Locale } from '../../common/i18n/locale.types';
import { readText, writeText } from '../../common/i18n/localized.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ArticleAdminDto, CreateArticleDto, UpdateArticleDto } from './dto/article-admin.dto';
import { ArticleDetailDto, ArticleLinkDto } from './dto/article-detail.dto';
import { ArticleStubDto } from './dto/article-stub.dto';
import { DatabaseTreeDto } from './dto/database-tree.dto';
import { CreateFolderDto, FolderAdminDto, UpdateFolderDto } from './dto/folder-admin.dto';
import { FolderNodeDto } from './dto/folder-node.dto';
import { collectLocalizedStrings, extractWikilinks, slugifyToken } from './wikilink';

const BREADCRUMB_GUARD = 16;

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(locale: Locale): Promise<DatabaseTreeDto> {
    const [folders, articles] = await Promise.all([
      this.prisma.folder.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.article.findMany({ orderBy: { order: 'asc' } }),
    ]);

    const folderIds = new Set(folders.map((folder) => folder.id));
    const stubsByFolder = new Map<string, ArticleStubDto[]>();
    const rootArticles: ArticleStubDto[] = [];
    for (const article of articles) {
      const stub = this.toStub(article, locale);
      const folderId = article.folderId;
      if (folderId !== null && folderIds.has(folderId)) {
        const siblings = stubsByFolder.get(folderId) ?? [];
        siblings.push(stub);
        stubsByFolder.set(folderId, siblings);
      } else {
        // Статья без папки (или с битой ссылкой) — показываем в корне.
        rootArticles.push(stub);
      }
    }

    const childrenByParent = new Map<string | null, Folder[]>();
    for (const folder of folders) {
      const siblings = childrenByParent.get(folder.parentId) ?? [];
      siblings.push(folder);
      childrenByParent.set(folder.parentId, siblings);
    }

    const buildNodes = (parentId: string | null): FolderNodeDto[] =>
      (childrenByParent.get(parentId) ?? []).map((folder) => ({
        id: folder.id,
        name: localize(folder.name, locale),
        order: folder.order,
        articles: stubsByFolder.get(folder.id) ?? [],
        children: buildNodes(folder.id),
      }));

    return { folders: buildNodes(null), rootArticles };
  }

  async getArticle(slug: string, locale: Locale): Promise<ArticleDetailDto> {
    const article = await this.prisma.article.findUnique({ where: { slug } });
    if (!article) {
      throw new NotFoundException(`Статья "${slug}" не найдена`);
    }

    const [folders, articles] = await Promise.all([
      this.prisma.folder.findMany(),
      this.prisma.article.findMany({ orderBy: { order: 'asc' } }),
    ]);

    return {
      slug: article.slug,
      title: localize(article.title, locale),
      bodyMarkdown: localize(article.bodyMarkdown, locale),
      tags: article.tags,
      status: article.status,
      updatedAt: article.updatedAt.toISOString(),
      breadcrumb: this.buildBreadcrumb(article.folderId, folders, locale),
      backlinks: this.findBacklinks(article, articles, locale),
    };
  }

  private toStub(article: Article, locale: Locale): ArticleStubDto {
    return {
      id: article.id,
      slug: article.slug,
      title: localize(article.title, locale),
      tags: article.tags,
      status: article.status,
      order: article.order,
    };
  }

  private buildBreadcrumb(folderId: string | null, folders: Folder[], locale: Locale): string[] {
    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    const names: string[] = [];
    let current = folderId;
    let guard = 0;
    while (current !== null && guard < BREADCRUMB_GUARD) {
      const folder = byId.get(current);
      if (!folder) break;
      names.unshift(localize(folder.name, locale));
      current = folder.parentId;
      guard += 1;
    }
    return names;
  }

  // Бэклинки: другие статьи, чьё тело содержит вики-ссылку на целевую — по slug
  // или по заголовку, в любой из локалей.
  private findBacklinks(target: Article, articles: Article[], locale: Locale): ArticleLinkDto[] {
    const titleVariants = new Set(
      collectLocalizedStrings(target.title).map((title) => title.toLowerCase()),
    );
    const pointsToTarget = (token: string): boolean =>
      slugifyToken(token) === target.slug || titleVariants.has(token.trim().toLowerCase());

    return articles
      .filter((article) => article.slug !== target.slug)
      .filter((article) =>
        extractWikilinks(collectLocalizedStrings(article.bodyMarkdown)).some(pointsToTarget),
      )
      .map((article) => ({ slug: article.slug, title: localize(article.title, locale) }));
  }

  // --- admin: папки ---

  async listFolders(): Promise<FolderAdminDto[]> {
    const folders = await this.prisma.folder.findMany({ orderBy: { order: 'asc' } });
    return folders.map((folder) => this.toFolderDto(folder));
  }

  async createFolder(dto: CreateFolderDto): Promise<FolderAdminDto> {
    if (dto.parentId) await this.ensureFolder(dto.parentId);
    const folder = await this.prisma.folder.create({
      data: {
        name: writeText(dto.name),
        parentId: dto.parentId ?? null,
        order: dto.order ?? 0,
      },
    });
    return this.toFolderDto(folder);
  }

  async updateFolder(id: string, dto: UpdateFolderDto): Promise<FolderAdminDto> {
    await this.ensureFolder(id);
    const data: Prisma.FolderUpdateInput = {};
    if (dto.name !== undefined) data.name = writeText(dto.name);
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.parentId !== undefined) {
      await this.assertReparentable(id, dto.parentId);
      data.parent = dto.parentId ? { connect: { id: dto.parentId } } : { disconnect: true };
    }

    const folder = await this.prisma.folder.update({ where: { id }, data });
    return this.toFolderDto(folder);
  }

  async removeFolder(id: string): Promise<void> {
    await this.ensureFolder(id);
    const [children, articles] = await Promise.all([
      this.prisma.folder.count({ where: { parentId: id } }),
      this.prisma.article.count({ where: { folderId: id } }),
    ]);
    if (children > 0 || articles > 0) {
      throw new BadRequestException(
        'Нельзя удалить непустую папку — сначала перенесите содержимое',
      );
    }
    await this.prisma.folder.delete({ where: { id } });
  }

  // --- admin: статьи ---

  async getArticleAdmin(id: string): Promise<ArticleAdminDto> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Статья "${id}" не найдена`);
    }
    return this.toArticleDto(article);
  }

  async createArticle(dto: CreateArticleDto): Promise<ArticleAdminDto> {
    await this.assertSlugFree(dto.slug);
    if (dto.folderId) await this.ensureFolder(dto.folderId);

    const article = await this.prisma.article.create({
      data: {
        slug: dto.slug,
        title: writeText(dto.title),
        bodyMarkdown: writeText(dto.bodyMarkdown),
        tags: dto.tags ?? [],
        status: dto.status ?? 'DRAFT',
        order: dto.order ?? 0,
        folderId: dto.folderId ?? null,
      },
    });
    return this.toArticleDto(article);
  }

  async updateArticle(id: string, dto: UpdateArticleDto): Promise<ArticleAdminDto> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Статья "${id}" не найдена`);
    }
    if (dto.slug !== undefined && dto.slug !== article.slug) await this.assertSlugFree(dto.slug);
    if (dto.folderId) await this.ensureFolder(dto.folderId);

    const data: Prisma.ArticleUpdateInput = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if (dto.title !== undefined) data.title = writeText(dto.title);
    if (dto.bodyMarkdown !== undefined) data.bodyMarkdown = writeText(dto.bodyMarkdown);
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.order !== undefined) data.order = dto.order;
    if (dto.folderId !== undefined) {
      data.folder = dto.folderId ? { connect: { id: dto.folderId } } : { disconnect: true };
    }

    const updated = await this.prisma.article.update({ where: { id }, data });
    return this.toArticleDto(updated);
  }

  async removeArticle(id: string): Promise<void> {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Статья "${id}" не найдена`);
    }
    await this.prisma.article.delete({ where: { id } });
  }

  private async ensureFolder(id: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder) {
      throw new NotFoundException(`Папка "${id}" не найдена`);
    }
  }

  private async assertSlugFree(slug: string): Promise<void> {
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Статья со slug "${slug}" уже существует`);
    }
  }

  // Запрещаем циклы: новая родительская папка не может быть самой папкой или её потомком.
  private async assertReparentable(id: string, parentId?: string): Promise<void> {
    if (!parentId) return;
    if (parentId === id) {
      throw new BadRequestException('Папка не может быть родителем самой себе');
    }
    await this.ensureFolder(parentId);

    const folders = await this.prisma.folder.findMany({ select: { id: true, parentId: true } });
    const parentOf = new Map(folders.map((folder) => [folder.id, folder.parentId]));
    let cursor: string | null | undefined = parentId;
    let guard = 0;
    while (cursor && guard < BREADCRUMB_GUARD) {
      if (cursor === id) {
        throw new BadRequestException('Нельзя переместить папку в её собственного потомка');
      }
      cursor = parentOf.get(cursor) ?? null;
      guard += 1;
    }
  }

  private toFolderDto(folder: Folder): FolderAdminDto {
    return {
      id: folder.id,
      name: readText(folder.name),
      parentId: folder.parentId,
      order: folder.order,
    };
  }

  private toArticleDto(article: Article): ArticleAdminDto {
    return {
      id: article.id,
      slug: article.slug,
      title: readText(article.title),
      bodyMarkdown: readText(article.bodyMarkdown),
      tags: article.tags,
      status: article.status,
      order: article.order,
      folderId: article.folderId,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}
