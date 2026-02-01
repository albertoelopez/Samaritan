import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Delete existing entries in correct order (respecting foreign keys)
  await knex('messages').del();
  await knex('conversation_participants').del();
  await knex('conversations').del();
  await knex('notifications').del();
  await knex('transactions').del();
  await knex('payment_methods').del();
  await knex('reviews').del();
  await knex('milestones').del();
  await knex('time_entries').del();
  await knex('contracts').del();
  await knex('job_applications').del();
  await knex('jobs').del();
  await knex('worker_skills').del();
  await knex('contractor_profiles').del();
  await knex('worker_profiles').del();
  await knex('users').del();

  const passwordHash = await bcrypt.hash('password123', 10);

  // Insert sample users
  const [adminUser] = await knex('users')
    .insert({
      email: 'admin@homedepotpaisano.com',
      phone_number: '+15551234567',
      password_hash: passwordHash,
      role: 'admin',
      status: 'active',
      first_name: 'Admin',
      last_name: 'User',
      email_verified: true,
      phone_verified: true,
    })
    .returning('*');

  const [worker1User] = await knex('users')
    .insert({
      email: 'worker1@example.com',
      phone_number: '+15552345678',
      password_hash: passwordHash,
      role: 'worker',
      status: 'active',
      first_name: 'Juan',
      last_name: 'Garcia',
      email_verified: true,
      phone_verified: true,
    })
    .returning('*');

  const [worker2User] = await knex('users')
    .insert({
      email: 'worker2@example.com',
      phone_number: '+15553456789',
      password_hash: passwordHash,
      role: 'worker',
      status: 'active',
      first_name: 'Maria',
      last_name: 'Rodriguez',
      email_verified: true,
      phone_verified: true,
    })
    .returning('*');

  const [contractor1User] = await knex('users')
    .insert({
      email: 'contractor1@example.com',
      phone_number: '+15554567890',
      password_hash: passwordHash,
      role: 'contractor',
      status: 'active',
      first_name: 'John',
      last_name: 'Smith',
      email_verified: true,
      phone_verified: true,
    })
    .returning('*');

  const [contractor2User] = await knex('users')
    .insert({
      email: 'contractor2@example.com',
      phone_number: '+15555678901',
      password_hash: passwordHash,
      role: 'contractor',
      status: 'active',
      first_name: 'Sarah',
      last_name: 'Johnson',
      email_verified: true,
      phone_verified: true,
    })
    .returning('*');

  // Create worker profiles
  const [worker1Profile] = await knex('worker_profiles')
    .insert({
      user_id: worker1User.id,
      bio: 'Experienced construction worker with 10+ years in residential and commercial projects.',
      hourly_rate_min: 20,
      hourly_rate_max: 35,
      years_of_experience: 10,
      available_for_work: true,
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.2437, 34.0522), 4326)"), // Los Angeles
      service_radius_km: 30,
      rating_average: 4.8,
      rating_count: 47,
      completed_jobs_count: 52,
      verification_status: 'verified',
    })
    .returning('*');

  const [worker2Profile] = await knex('worker_profiles')
    .insert({
      user_id: worker2User.id,
      bio: 'Skilled painter and drywall specialist. Clean, efficient, and reliable.',
      hourly_rate_min: 18,
      hourly_rate_max: 28,
      years_of_experience: 5,
      available_for_work: true,
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.1937, 34.1522), 4326)"), // Pasadena area
      service_radius_km: 25,
      rating_average: 4.6,
      rating_count: 23,
      completed_jobs_count: 28,
      verification_status: 'verified',
    })
    .returning('*');

  // Create contractor profiles
  const [contractor1Profile] = await knex('contractor_profiles')
    .insert({
      user_id: contractor1User.id,
      company_name: 'Smith Construction LLC',
      company_description: 'Full-service construction company specializing in home renovations.',
      company_size: '10-50',
      industry: 'Construction',
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.3287, 34.0925), 4326)"), // West Hollywood
      website_url: 'https://smithconstruction.example.com',
      rating_average: 4.7,
      rating_count: 89,
      posted_jobs_count: 34,
      hired_workers_count: 127,
      verification_status: 'verified',
    })
    .returning('*');

  const [contractor2Profile] = await knex('contractor_profiles')
    .insert({
      user_id: contractor2User.id,
      company_name: 'Johnson Home Services',
      company_description: 'Residential home improvement and repair services.',
      company_size: '1-10',
      industry: 'Home Services',
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.3987, 33.9425), 4326)"), // Torrance area
      website_url: 'https://johnsonhome.example.com',
      rating_average: 4.5,
      rating_count: 42,
      posted_jobs_count: 18,
      hired_workers_count: 45,
      verification_status: 'verified',
    })
    .returning('*');

  // Add skills to workers
  const categories = await knex('categories').select('*');
  const getCategoryId = (slug: string) => categories.find(c => c.slug === slug)?.id;

  await knex('worker_skills').insert([
    {
      worker_id: worker1Profile.id,
      category_id: getCategoryId('construction'),
      years_of_experience: 10,
    },
    {
      worker_id: worker1Profile.id,
      category_id: getCategoryId('general-labor'),
      years_of_experience: 10,
    },
    {
      worker_id: worker1Profile.id,
      category_id: getCategoryId('demolition'),
      years_of_experience: 8,
    },
    {
      worker_id: worker2Profile.id,
      category_id: getCategoryId('painting'),
      years_of_experience: 5,
    },
    {
      worker_id: worker2Profile.id,
      category_id: getCategoryId('drywall'),
      years_of_experience: 4,
    },
  ]);

  // Create sample jobs
  const [job1] = await knex('jobs')
    .insert({
      contractor_id: contractor1Profile.id,
      title: 'Kitchen Renovation Helper Needed',
      description: 'Looking for experienced laborers to assist with kitchen renovation project. Tasks include demolition, debris removal, and general assistance to lead contractor.',
      category_id: getCategoryId('construction'),
      job_type: 'one_time',
      payment_type: 'hourly',
      hourly_rate: 25,
      estimated_hours: 40,
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.3287, 34.0925), 4326)"),
      is_remote: false,
      required_workers: 2,
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      status: 'published',
      published_at: new Date(),
    })
    .returning('*');

  const [job2] = await knex('jobs')
    .insert({
      contractor_id: contractor2Profile.id,
      title: 'House Painting - Interior',
      description: 'Need a skilled painter for interior painting of a 3-bedroom house. Must have own equipment and transportation.',
      category_id: getCategoryId('painting'),
      job_type: 'one_time',
      payment_type: 'fixed',
      budget_min: 1500,
      budget_max: 2500,
      location: knex.raw("ST_SetSRID(ST_MakePoint(-118.3987, 33.9425), 4326)"),
      is_remote: false,
      required_workers: 1,
      start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      status: 'published',
      published_at: new Date(),
    })
    .returning('*');

  // Create sample application
  await knex('job_applications').insert({
    job_id: job2.id,
    worker_id: worker2Profile.id,
    status: 'pending',
    proposed_rate: 2000,
    cover_letter: 'I have 5 years of experience in interior painting and would love to take on this project. I can guarantee clean, professional work.',
  });

  console.log('Seed data inserted successfully!');
  console.log(`Created users: admin, 2 workers, 2 contractors`);
  console.log(`Created ${categories.length} categories`);
  console.log(`Created 2 sample jobs`);
}
