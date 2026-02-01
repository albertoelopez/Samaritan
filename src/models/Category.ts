import { db } from '../config/database';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_category_id: string | null;
  description: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: Date;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'created_at'>;
export type UpdateCategoryInput = Partial<Omit<Category, 'id' | 'created_at'>>;

export class CategoryModel {
  static tableName = 'categories';

  static async findById(id: string): Promise<Category | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findBySlug(slug: string): Promise<Category | null> {
    return db(this.tableName).where({ slug }).first();
  }

  static async findAll(includeInactive = false): Promise<Category[]> {
    let query = db(this.tableName);
    if (!includeInactive) {
      query = query.where({ is_active: true });
    }
    return query.orderBy('name', 'asc');
  }

  static async findByParent(parentId: string | null): Promise<Category[]> {
    return db(this.tableName)
      .where({ parent_category_id: parentId, is_active: true })
      .orderBy('name', 'asc');
  }

  static async create(input: CreateCategoryInput): Promise<Category> {
    const [category] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return category;
  }

  static async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const [category] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return category || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id })
      .update({ is_active: false });
    return count > 0;
  }

  static async getWithSubcategories(): Promise<Category[]> {
    const categories = await db(this.tableName)
      .where({ is_active: true })
      .orderBy('name', 'asc');

    // Build tree structure
    const categoryMap = new Map<string, Category & { subcategories?: Category[] }>();
    const rootCategories: (Category & { subcategories?: Category[] })[] = [];

    for (const category of categories) {
      categoryMap.set(category.id, { ...category, subcategories: [] });
    }

    for (const category of categories) {
      const cat = categoryMap.get(category.id)!;
      if (category.parent_category_id) {
        const parent = categoryMap.get(category.parent_category_id);
        if (parent) {
          parent.subcategories!.push(cat);
        }
      } else {
        rootCategories.push(cat);
      }
    }

    return rootCategories;
  }
}
