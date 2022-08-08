var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moment = require('moment');

var commentSchema = new Schema(
    {
        content: {type: String, required: true},
        time: {type: Date, default: Date.now},
        post: {type: Schema.Types.ObjectId, ref: "Post"},
        email: {type: String, required: true}
    }
);

commentSchema
.virtual('ago')
.get(function () {

  const now = new Date();
  const nowMoment = moment(now);
  const pastMoment = moment(this.time);
  const timeAgoString = pastMoment.from(nowMoment); // 2 hours ago
  return timeAgoString;

});

module.exports = mongoose.model("Comment", commentSchema);