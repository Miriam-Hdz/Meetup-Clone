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
      Group.hasMany(
        models.Member,
        { foreignKey: 'group_id', onDelete: 'CASCADE', hooks: true}
      );
      Group.belongsTo(
        models.User,
        { foreignKey: 'organizer_id' }
      );
    }
  }
  Group.init({
    name: DataTypes.STRING,
    about: DataTypes.STRING,
    type: DataTypes.STRING,
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    num_members: DataTypes.INTEGER,
    organizer_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};
