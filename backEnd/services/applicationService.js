import ApplicationDomain from "../domains/Application.js";

class ApplicationService {
  async createApplication(data) {
    const app = new ApplicationDomain(data.player, data.targetType, data.targetId);
    return await app.create();
  }

  async getApplicationById(id) {
    const app = await ApplicationDomain.findById(id);
    if (!app) throw new Error("Application not found");
    return app;
  }

  async getAllApplications() {
    return await ApplicationDomain.findAll();
  }

  async getApplicationsByPlayer(playerId) {
    return await ApplicationDomain.findByPlayer(playerId);
  }

  async getApplicationsByTarget(targetType, targetId) {
    return await ApplicationDomain.findByTarget(targetType, targetId);
  }

  async approveApplication(id) {
    const app = await this.getApplicationById(id);
    return await app.approve();
  }

  async rejectApplication(id) {
    const app = await this.getApplicationById(id);
    return await app.reject();
  }

  async deleteApplication(id) {
    const deleted = await ApplicationDomain.delete(id);
    if (!deleted) throw new Error("Application not found");
    return deleted;
  }
}

export default new ApplicationService();
