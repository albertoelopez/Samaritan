import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries
  await knex('categories').del();

  // Insert categories
  await knex('categories').insert([
    {
      name: 'General Labor',
      slug: 'general-labor',
      description: 'General construction and manual labor tasks',
      is_active: true,
    },
    {
      name: 'Construction',
      slug: 'construction',
      description: 'Building and construction work',
      is_active: true,
    },
    {
      name: 'Plumbing',
      slug: 'plumbing',
      description: 'Plumbing installation and repair',
      is_active: true,
    },
    {
      name: 'Electrical',
      slug: 'electrical',
      description: 'Electrical work and installations',
      is_active: true,
    },
    {
      name: 'Carpentry',
      slug: 'carpentry',
      description: 'Woodworking and carpentry services',
      is_active: true,
    },
    {
      name: 'Painting',
      slug: 'painting',
      description: 'Interior and exterior painting',
      is_active: true,
    },
    {
      name: 'Landscaping',
      slug: 'landscaping',
      description: 'Lawn care and landscaping services',
      is_active: true,
    },
    {
      name: 'Roofing',
      slug: 'roofing',
      description: 'Roof installation and repair',
      is_active: true,
    },
    {
      name: 'HVAC',
      slug: 'hvac',
      description: 'Heating, ventilation, and air conditioning',
      is_active: true,
    },
    {
      name: 'Flooring',
      slug: 'flooring',
      description: 'Floor installation and repair',
      is_active: true,
    },
    {
      name: 'Masonry',
      slug: 'masonry',
      description: 'Brick, stone, and concrete work',
      is_active: true,
    },
    {
      name: 'Welding',
      slug: 'welding',
      description: 'Metal fabrication and welding',
      is_active: true,
    },
    {
      name: 'Demolition',
      slug: 'demolition',
      description: 'Demolition and removal services',
      is_active: true,
    },
    {
      name: 'Drywall',
      slug: 'drywall',
      description: 'Drywall installation and repair',
      is_active: true,
    },
    {
      name: 'Tiling',
      slug: 'tiling',
      description: 'Tile installation for floors and walls',
      is_active: true,
    },
    {
      name: 'Moving',
      slug: 'moving',
      description: 'Moving and hauling services',
      is_active: true,
    },
    {
      name: 'Cleaning',
      slug: 'cleaning',
      description: 'Construction and residential cleaning',
      is_active: true,
    },
    {
      name: 'Handyman',
      slug: 'handyman',
      description: 'General handyman services',
      is_active: true,
    },
    {
      name: 'Assembly',
      slug: 'assembly',
      description: 'Furniture and equipment assembly',
      is_active: true,
    },
    {
      name: 'Other',
      slug: 'other',
      description: 'Other miscellaneous labor',
      is_active: true,
    },
  ]);
}
