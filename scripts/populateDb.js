const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check .env.local file.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Helper to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Main function to populate the database
async function populateDatabase() {
  try {
    console.log('Starting database population...');

    // Create test users
    console.log('Creating test users...');
    
    // Create an admin user
    const adminPassword = await hashPassword('admin123');
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .insert({
        email: 'liberator8461071@gmail.com',
        password_hash: adminPassword,
        role: 'admin',
        name: 'Admin User',
      })
      .select();
    
    if (adminError) {
      throw new Error(`Error creating admin user: ${adminError.message}`);
    }
    
    const adminId = adminData[0].id;
    console.log('Admin user created with ID:', adminId);
    
    // Create a GM user
    const gmPassword = await hashPassword('gm123');
    const { data: gmData, error: gmError } = await supabase
      .from('users')
      .insert({
        email: 'liberator846071@gmail.com',
        password_hash: gmPassword,
        role: 'gm',
        name: 'Game Master',
      })
      .select();
    
    if (gmError) {
      throw new Error(`Error creating GM user: ${gmError.message}`);
    }
    
    const gmId = gmData[0].id;
    console.log('GM user created with ID:', gmId);
    
    // Create some player users
    const players = [
      { email: 'robalobalubob@gmail.com', name: 'Aragorn' },
      { email: 'player2@test.com', name: 'Gandalf' },
      { email: 'player3@test.com', name: 'Legolas' },
      { email: 'player4@test.com', name: 'Gimli' },
      { email: 'player5@test.com', name: 'Frodo' }
    ];
    
    const playerIds = [];
    
    for (const player of players) {
      const playerPassword = await hashPassword('player123');
      const { data: playerData, error: playerError } = await supabase
        .from('users')
        .insert({
          email: player.email,
          password_hash: playerPassword,
          role: 'user',
          name: player.name,
        })
        .select();
      
      if (playerError) {
        throw new Error(`Error creating player ${player.name}: ${playerError.message}`);
      }
      
      playerIds.push(playerData[0].id);
      console.log(`Player ${player.name} created with ID: ${playerData[0].id}`);
    }
    
    // Create availabilities
    console.log('Creating player availabilities...');
    
    const availabilities = [
      {
        user_id: playerIds[0],
        name: 'Weeknights',
        selected_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        time_option: 'specific',
        start_time: '18:00',
        end_time: '22:00',
        repeat_option: 'weekly',
        repeat_weeks: 4
      },
      {
        user_id: playerIds[1],
        name: 'Weekend afternoons',
        selected_days: ['Saturday', 'Sunday'],
        time_option: 'specific',
        start_time: '13:00',
        end_time: '17:00',
        repeat_option: 'weekly',
        repeat_weeks: 8
      },
      {
        user_id: playerIds[2],
        name: 'Late nights',
        selected_days: ['Friday', 'Saturday'],
        time_option: 'specific',
        start_time: '20:00',
        end_time: '24:00',
        repeat_option: 'weekly',
        repeat_weeks: 4
      },
      {
        user_id: playerIds[3],
        name: 'Tuesday and Thursday',
        selected_days: ['Tuesday', 'Thursday'],
        time_option: 'specific',
        start_time: '19:00',
        end_time: '23:00',
        repeat_option: 'biweekly',
        repeat_weeks: 6
      },
      {
        user_id: playerIds[4],
        name: 'Weekend availability',
        selected_days: ['Saturday'],
        time_option: 'allDay',
        start_time: '',
        end_time: '',
        repeat_option: 'weekly',
        repeat_weeks: 4
      },
      {
        user_id: gmId,
        name: 'GM availability',
        selected_days: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        time_option: 'specific',
        start_time: '18:00',
        end_time: '23:00',
        repeat_option: 'weekly',
        repeat_weeks: 8
      }
    ];
    
    for (const availability of availabilities) {
      const { error } = await supabase
        .from('availabilities')
        .insert(availability);
      
      if (error) {
        throw new Error(`Error creating availability: ${error.message}`);
      }
    }
    
    console.log('Availabilities created successfully');
    
    // Create future sessions
    console.log('Creating future game sessions...');
    
    // Current date is April 12, 2025 (as per context)
    const currentDate = new Date('2025-04-12T12:00:00Z');
    
    // Generate dates for future sessions
    const futureSession1 = new Date(currentDate);
    futureSession1.setDate(currentDate.getDate() + 7); // 1 week from now
    
    const futureSession2 = new Date(currentDate);
    futureSession2.setDate(currentDate.getDate() + 14); // 2 weeks from now
    
    const futureSession3 = new Date(currentDate);
    futureSession3.setDate(currentDate.getDate() + 21); // 3 weeks from now
    
    const sessions = [
      {
        title: 'Age of Ashes: Chapter 1',
        session_date: futureSession1.toISOString(),
        date: futureSession1.toISOString(),
        user_id: gmId,
        created_by: 'Game Master',
        gm_id: gmId
      },
      {
        title: 'Abomination Vaults: Intro Session',
        session_date: futureSession2.toISOString(),
        date: futureSession2.toISOString(),
        user_id: gmId,
        created_by: 'Game Master',
        gm_id: gmId
      },
      {
        title: 'Strength of Thousands: Session 3',
        session_date: futureSession3.toISOString(),
        date: futureSession3.toISOString(),
        user_id: adminId,
        created_by: 'Admin User',
        gm_id: adminId
      }
    ];
    
    for (const session of sessions) {
      const { error } = await supabase
        .from('sessions')
        .insert(session);
      
      if (error) {
        throw new Error(`Error creating session: ${error.message}`);
      }
    }
    
    console.log('Sessions created successfully');
    
    console.log('\nDatabase population completed successfully!');
    console.log('\nLogin credentials:');
    console.log('- Admin: admin@pathfinder.com / admin123');
    console.log('- GM: gm@pathfinder.com / gm123');
    console.log('- Players: player1@pathfinder.com through player5@pathfinder.com / password: player123');
    
  } catch (error) {
    console.error('Error during database population:', error);
    process.exit(1);
  }
}

// Run the script
populateDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });