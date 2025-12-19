const mongoose = require("mongoose");
const ErrorHandler = require("../utils/ErrorHandler");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "จำเป็นต้องมีหัวเรื่อง"],
  },
  description: String,
  startDate: {
    type: Date,
    required: [true, "จำเป็นต้องมีวันเริ่มต้น"],
  },
  dueDate: Date,
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
  },
  status: {
    type: String,
    enum: ["สิ่งที่ต้องดำเนินการ", "รอดำเนินการ", "เสร็จสิ้น"],
    default: "สิ่งที่ต้องดำเนินการ",
  },
  tags: [
    {
      id: String,
      text: String,
    },
  ],
  lastUpdated: { type: Date, default: new Date() },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference
    required: [true, "a task must belong to a user"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  order: Number,
});

//Middleware to set the lastUpdated automatically the first time

taskSchema.pre("save", function (next) {
  if (this.dueDate && !(this.dueDate >= this.startDate))
    return next(
      new ErrorHandler("วันที่ครบกำหนดต้องอยู่หลังวันที่เริ่มต้น", 400)
    );

  next();
});

taskSchema.pre("findOneAndUpdate", async function (next) {
  this.getUpdate().lastUpdated = new Date();
  const dueDate = this.getUpdate().dueDate;
  if (dueDate && !(this.getUpdate().dueDate >= this.getUpdate().startDate))
    return next(
      new ErrorHandler("วันที่ครบกำหนดต้องอยู่หลังวันที่เริ่มต้น", 400)
    );
  next();
});

const Task = new mongoose.model("Tasks", taskSchema);

module.exports = Task;
