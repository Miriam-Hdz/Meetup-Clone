'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert("Attendees",[
    {
      status: "member",
      userId: 1,
      eventId: 1
    },
    {
      status: "member",
      userId: 2,
      eventId: 1
    },
    {
      status: "waitlist",
      userId: 3,
      eventId: 1
    },
    {
      status: "pending",
      userId: 4,
      eventId: 1
    }
   ])
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Attendees", {
      id: [1, 2, 3, 4]
    })
  }
};
