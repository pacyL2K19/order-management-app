import mongoose from 'mongoose';

class Database {
  private uri: string;
  private static instance: Database;

  constructor(uri: string) {
    console.log('Database -> constructor -> uri', uri);
    this.uri = uri;
  }

  // Singleton pattern to ensure only one instance of the database is created
  public static getInstance(uri: string): Database {
    if (!this.instance) {
      this.instance = new Database(uri);
    }
    return this.instance;
  }

  async connect() {
    try {
      await mongoose.connect(this.uri);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }
}

export default Database;
