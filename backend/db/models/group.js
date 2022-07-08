'use strict';

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Group.belongsToMany(
        models.User,
        { through: models.Member, foreignKey: 'groupId', otherKey: 'userId'}
      );
      Group.hasMany(
        models.Image,
        { foreignKey: 'groupId', onDelete: 'CASCADE', hooks: true}
      );
    }
  }
  Group.init({
    name: DataTypes.STRING(60),
    about: {
      type: DataTypes.STRING,
      validate: {
        len: [50, 1000000]
      }
    },
    type: {
      type: DataTypes.STRING,
      onlineOrInperson(value) {
        if (value !== 'Online' || value!== 'In person') {
          throw new Error("type must be Online or In person")
        }
      },
    },
    private: DataTypes.BOOLEAN,
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    numMembers: DataTypes.INTEGER,
    organizerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
