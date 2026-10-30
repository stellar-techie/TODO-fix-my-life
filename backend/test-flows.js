// Automated End-to-End Test Suite for TODO: fix my life (Journal & Planner)
const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🧪 Starting Full-Stack End-to-End Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    console.log('--- TEST 1: Server Health ---');
    const health = await request('/health');
    assert(health.status === 200 && health.data?.status === 'ok', 'Health endpoint responds with 200 OK');

    // 2. Registration for User A
    console.log('\n--- TEST 2: User A Registration ---');
    const userAData = {
      name: 'Maya Blossom',
      email: `maya_${Date.now()}@example.com`,
      password: 'password123',
    };
    const regA = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userAData),
    });
    assert(regA.status === 201 && regA.data.token, 'User A registered and received JWT token');
    const tokenA = regA.data?.token;
    const userAId = regA.data?.user?._id;

    // 3. User A Login
    console.log('\n--- TEST 3: User A Login ---');
    const loginA = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: userAData.email, password: 'password123' }),
    });
    assert(loginA.status === 200 && loginA.data.user.email === userAData.email, 'User A logged in with correct credentials');

    // 4. Invalid Login rejection
    const badLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: userAData.email, password: 'wrongpassword' }),
    });
    assert(badLogin.status === 401, 'Bad credentials rejected with 401');

    // 5. Journal Entry Creation for User A
    console.log('\n--- TEST 4: Journal CRUD for User A ---');
    const newEntry = {
      title: 'A Sunflower Day in the Meadow',
      content: 'Today was truly peaceful. Watched the golden sunset and drank jasmine tea ♡',
      mood: 'peaceful',
      tags: ['meadow', 'peace', 'tea'],
      sticker: 'sunflower',
      paperStyle: 'grid',
    };
    const createRes = await request('/entries', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify(newEntry),
    });
    assert(createRes.status === 201 && createRes.data.entry?.title === newEntry.title, 'Journal entry created successfully');
    const entryId = createRes.data?.entry?._id;

    // Read single entry
    const getRes = await request(`/entries/${entryId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(getRes.status === 200 && getRes.data.entry?._id === entryId, 'Journal entry fetched by ID');

    // Edit entry
    const updateRes = await request(`/entries/${entryId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'A Sunflower Day in the Meadow (Updated)' }),
    });
    assert(updateRes.status === 200 && updateRes.data.entry?.title.includes('Updated'), 'Journal entry updated');

    // Filter and search
    const searchRes = await request('/entries?search=meadow', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(searchRes.status === 200 && searchRes.data.entries.length >= 1, 'Search query returned matching entries');

    // 6. Planner Synchronization (Weekly + Daily)
    console.log('\n--- TEST 5: Planner Weekly & Daily Synchronization ---');
    const targetDate = '2026-10-11'; // Sunday
    
    // Fetch weekly planner for that week
    const weeklyRes = await request(`/planner/week/${targetDate}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(weeklyRes.status === 200 && weeklyRes.data.planner?.days?.length === 7, 'Weekly planner returned with 7 days');

    // Add task to Sunday
    const addTaskRes = await request(`/planner/day/${targetDate}/task`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ title: 'Study DSA Binary Trees', priority: 'high' }),
    });
    assert(addTaskRes.status === 201 && addTaskRes.data.day?.tasks?.length >= 1, 'Task added to Sunday via Daily Planner API');
    const taskId = addTaskRes.data.day.tasks[0]._id;

    // Toggle task completed
    const toggleRes = await request(`/planner/day/${targetDate}/task/${taskId}/toggle`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(toggleRes.status === 200 && toggleRes.data.task?.completed === true, 'Task completed status updated');

    // Update Daily Goal, Reminder, and Notes
    const updateDailyRes = await request(`/planner/day/${targetDate}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        goal: 'Master tree traversals and solve 5 problems',
        reminder: 'Submit homework by 5 PM',
        notes: 'In-order traversal of BST gives sorted keys!',
      }),
    });
    assert(
      updateDailyRes.status === 200 &&
      updateDailyRes.data.day?.goal.includes('Master tree') &&
      updateDailyRes.data.day?.reminder.includes('Submit homework') &&
      updateDailyRes.data.day?.notes.includes('In-order'),
      'Daily goal, reminder, and notes saved'
    );

    // Verify Weekly Planner view reflects Sunday updates (SAME underlying data!)
    const verifyWeekly = await request(`/planner/week/${targetDate}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const sundayInWeekly = verifyWeekly.data.planner.days.find((d) => d.date === targetDate);
    assert(
      sundayInWeekly &&
      sundayInWeekly.tasks.some((t) => t._id === taskId && t.completed === true) &&
      sundayInWeekly.goal.includes('Master tree'),
      'Weekly planner correctly reflects updated Sunday tasks and goal (full synchronization)'
    );

    // 7. Authorization & Security Tests (User B vs User A)
    console.log('\n--- TEST 6: Strict Authorization (User B vs User A) ---');
    const userBData = {
      name: 'Kiki Wood',
      email: `kiki_${Date.now()}@example.com`,
      password: 'password456',
    };
    const regB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userBData),
    });
    assert(regB.status === 201, 'User B created');
    const tokenB = regB.data?.token;

    // User B attempts to read User A's journal entry
    const bReadsA = await request(`/entries/${entryId}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(bReadsA.status === 403, 'User B CANNOT read User A journal entry (HTTP 403 Forbidden)');

    // User B attempts to edit User A's journal entry
    const bEditsA = await request(`/entries/${entryId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ title: 'Hacked by B' }),
    });
    assert(bEditsA.status === 403, 'User B CANNOT edit User A journal entry (HTTP 403 Forbidden)');

    // User B attempts to delete User A's journal entry
    const bDeletesA = await request(`/entries/${entryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(bDeletesA.status === 403, 'User B CANNOT delete User A journal entry (HTTP 403 Forbidden)');

    // User B planner is isolated
    const bPlanner = await request(`/planner/week/${targetDate}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    const bSunday = bPlanner.data.planner.days.find((d) => d.date === targetDate);
    assert(bSunday && bSunday.tasks.length === 0, 'User B planner is completely isolated and empty');

    // 8. User A Deletes Entry
    console.log('\n--- TEST 7: User A Deletes Entry ---');
    const deleteRes = await request(`/entries/${entryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(deleteRes.status === 200, 'User A deleted their own journal entry');

    // Verify it is gone
    const verifyDeleted = await request(`/entries/${entryId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(verifyDeleted.status === 404, 'Deleted entry returns 404 Not Found');

    console.log(`\n========================================`);
    console.log(`✨ Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
}

runTests();
