import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export class Store<T> {
  private filePath: string;
  private data: T;

  constructor(filename: string, private defaults: T) {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, filename);
    this.data = this.parseDataFile(this.filePath, defaults);
  }

  get(key: keyof T): any {
    return this.data[key];
  }

  set(key: keyof T, val: any) {
    this.data[key] = val;
    this.saveData();
  }

  getAll(): T {
    return this.data;
  }

  setAll(data: T) {
    this.data = data;
    this.saveData();
  }

  private parseDataFile(filePath: string, defaults: T): T {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
      return defaults;
    }
  }

  private saveData() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }
}
