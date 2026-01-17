import applicationService from "../services/applicationService.js";

// PLAYER
export const createApplication = async (req, res) => {
  try {
    const app = await applicationService.createApplication({
      player: req.user._id,
      ...req.body
    });
    res.status(201).json(app.toJSON());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getApplicationsByPlayer = async (req, res) => {
  try {
    const apps = await applicationService.getApplicationsByPlayer(req.user._id);
    res.json(apps.map(a => a.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// OPERATOR / ADMIN
export const getAllApplications = async (req, res) => {
  try {
    const apps = await applicationService.getAllApplications();
    res.json(apps.map(a => a.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getApplication = async (req, res) => {
  try {
    const app = await applicationService.getApplicationById(req.params.id);
    res.json(app.toJSON());
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

export const getApplicationsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const apps = await applicationService.getApplicationsByTarget(targetType, targetId);
    res.json(apps.map(a => a.toJSON()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const approveApplication = async (req, res) => {
  try {
    const app = await applicationService.approveApplication(req.params.id);
    res.json(app.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const app = await applicationService.rejectApplication(req.params.id);
    res.json(app.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const deleted = await applicationService.deleteApplication(req.params.id);
    res.json({ message: "Application deleted successfully", application: deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
