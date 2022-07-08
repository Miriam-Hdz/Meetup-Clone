'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.belongsTo(
        models.User,
        { foreignKey: 'userId'}
      );
      Member.belongsTo(
        models.Group,
        { foreignKey: 'groupId'}
      );
    }
  }
  Member.init({
    status: DataTypes.STRING,
    organizer: DataTypes.BOOLEAN,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};
