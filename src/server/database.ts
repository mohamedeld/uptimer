import { Sequelize } from 'sequelize';


const sequelize = new Sequelize(process.env.POSTGRES_DB as string) // Example for postgres

const connectToDB = async ()=>{
    try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}
}


export {
    connectToDB,
    sequelize
};