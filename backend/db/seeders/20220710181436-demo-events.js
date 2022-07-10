'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

   await queryInterface.bulkInsert('Events', [
    {
      name: "Tennis Group First Meet and Greet",
      description: "First meet and greet event for the evening tennis on the water group! Join us online for happy times!",
      type: "Online",
      capacity: 10,
      price: 18.50,
      startDate: "2021-11-19 20:00:00",
      endDate: "2021-11-19 21:00:00",
      numAttending: 8,
      groupId: 1,
      venueId: null
    },
    {
      name: "Tennis Singles",
      description: "Tennis singles let's get together, Yay!",
      type: "In person",
      capacity: 10,
      price: 18.50,
      startDate: "2021-11-20 20:00:00",
      endDate: "2021-11-20 21:00:00",
      numAttending: 10,
      groupId: 1,
      venueId: 1
    }
   ]);
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Events', {
      name: ["Tennis Group First Meet and Greet", "Tennis Singles"]
    });
  }
};
