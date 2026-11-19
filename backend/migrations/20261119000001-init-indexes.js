module.exports = {
  async up(db, client) {
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1, status: 1 });

    // Application indexes: compound unique index to prevent duplicate applications
    await db.collection('applications').createIndex({ user: 1, job: 1 }, { unique: true });
    await db.collection('applications').createIndex({ job: 1, status: 1 });
    await db.collection('applications').createIndex({ user: 1, appliedAt: -1 });

    // JobPost indexes
    await db.collection('jobposts').createIndex({ status: 1, category: 1 });
    await db.collection('jobposts').createIndex({ createdBy: 1 });
    await db.collection('jobposts').createIndex({ createdAt: -1 });
  },

  async down(db, client) {
    try {
      await db.collection('users').dropIndex({ email: 1 });
      await db.collection('applications').dropIndex({ user: 1, job: 1 });
      await db.collection('jobposts').dropIndex({ status: 1, category: 1 });
    } catch (err) {
      console.warn('Index drop warning:', err.message);
    }
  }
};
