'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Venues', [
    {
      address: "123 Disney Lane",
      city: "New York",
      state: "NY",
      lat: 37.7645358,
      lng: -122.4730327,
      groupId: 1
    }
   ]);
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.bulkDelete('Venues', {
      address: ["123 Disney Lane"]
    });
  }
};
