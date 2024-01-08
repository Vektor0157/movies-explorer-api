const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        const user = ret;
        delete user.password;
      },
    },
    toObject: {
      transform(_doc, ret) {
        const user = ret;
        delete user.password;
      },
    },
  },
);

module.exports = mongoose.model('user', userSchema);
