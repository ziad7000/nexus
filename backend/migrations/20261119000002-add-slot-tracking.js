module.exports = {
  async up(db, client) {
    // Populate remainingSlots from totalSlots if missing
    await db.collection('jobposts').updateMany(
      { remainingSlots: { $exists: false } },
      [
        {
          $set: {
            remainingSlots: { $ifNull: ['$totalSlots', 1] }
          }
        }
      ]
    );
  },

  async down(db, client) {
    await db.collection('jobposts').updateMany(
      {},
      { $unset: { remainingSlots: '' } }
    );
  }
};
