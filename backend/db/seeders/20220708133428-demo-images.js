'use strict';

const { query } = require("express");

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('Images', [
    {
      imageableType: 'group',
      url: 'image url 1',
      groupId: 1
    },
    {
      imageableType: 'group',
      url: 'image url 2',
      groupId: 1
    }
   ]);
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.bulkDelete('Images', {
      groupId: [1]
     });
  }
};
