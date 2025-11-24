const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    name: {
      type: 'varchar',
      nullable: true
    },
    createdAt: {
      type: 'timestamp with time zone',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp with time zone',
      updateDate: true
    }
  }
});
