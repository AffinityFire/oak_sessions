import Store from "./Store.ts";
import { SessionData } from "../Session.ts";
import type { Client } from "@db/postgres";

export default class PostgresStore implements Store {
  sql: Client;
  tableName: string;

  constructor(sql: Client, tableName = "sessions") {
    this.sql = sql;
    this.tableName = tableName;
  }

  async initSessionsTable() {
    await this.sql
      .queryArray`create table if not exists ${this.tableName} (id varchar(21) not null primary key, data varchar)`;
  }

  async getSessionById(sessionId: string) {
    const result = await this.sql.queryObject<
      { data: string }
    >`select data from ${this.tableName} where id = ${sessionId}`;
    if (!result) return null;
    const s = result?.rows.at(0);
    return s ? JSON.parse(s.data) as SessionData : null;
  }

  async createSession(sessionId: string, initialData: SessionData) {
    await this.sql
      .queryArray`insert into ${this.tableName} (id, data) values (${sessionId}, ${
      JSON.stringify(initialData)
    })`;
  }

  async deleteSession(sessionId: string) {
    await this.sql
      .queryArray`delete from ${this.tableName} where id = ${sessionId}`;
  }

  async persistSessionData(sessionId: string, sessionData: SessionData) {
    await this.sql.queryArray`update ${this.tableName} set data = ${
      JSON.stringify(sessionData)
    } where id = ${sessionId}`;
  }
}
