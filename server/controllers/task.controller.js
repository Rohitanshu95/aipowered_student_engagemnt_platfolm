import UserTask from "../models/task.model.js";

export const createTask = async (req, res) => {
    try {
        const { title, date, source, roadmapId } = req.body;
        const newTask = new UserTask({
            userId: req.userId,
            title,
            date,
            source: source || "Manual",
            roadmapId
        });
        await newTask.save();
        res.status(201).json({ success: true, task: newTask });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create task." });
    }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = await UserTask.find({ userId: req.userId }).sort({ date: 1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tasks." });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const task = await UserTask.findOneAndUpdate(
            { _id: id, userId: req.userId },
            req.body,
            { returnDocument: 'after' }
        );
        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update task." });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        await UserTask.findOneAndDelete({ _id: id, userId: req.userId });
        res.status(200).json({ success: true, message: "Task deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete task." });
    }
};
