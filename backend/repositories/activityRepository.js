const db = require('../config/db');

class ActivityRepository {
  async create({ userId, role, action, summary, outcome = 'success', req }) {
    await db.query(
      `INSERT INTO activity_logs
       (user_id, role, action, summary, outcome, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId || null,
        role || null,
        action,
        summary,
        outcome,
        req?.ip || null,
        req?.get('user-agent') || null
      ]
    );
  }

  async cleanupOld() {
    await db.query('DELETE FROM activity_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)');
  }

  async findRecent(page = 1, pageSize = 50) {
    await this.cleanupOld();
    const offset = (page - 1) * pageSize;
    const [[count]] = await db.query('SELECT COUNT(*) AS total FROM activity_logs');
    const [rows] = await db.query(
      `SELECT al.id, al.user_id, al.role, al.action, al.summary, al.outcome,
              al.ip_address, al.created_at, COALESCE(u.nama_lengkap, 'Sistem') AS nama_lengkap
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT ?`,
       [pageSize, offset]
    );
     return { rows, total: Number(count.total) };
  }
}

module.exports = new ActivityRepository();
