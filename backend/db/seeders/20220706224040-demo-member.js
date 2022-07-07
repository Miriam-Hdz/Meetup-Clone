'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Members', [
    {
      status: 'member',
      organizer: true,
      memberId: 1,
      groupId: 1
    },
    {
      status: 'co-host',
      organizer: false,
      memberId: 2,
      groupId: 1
    },
    {
      status: 'member',
      organizer: false,
      memberId: 3,
      groupId: 1
    },
    {
      status: 'pending',
      organizer: false,
      memberId: 4,
      groupId: 1
    },
   ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Members', {
      memberId: [1, 2, 3, 4]
    });
  }
};
