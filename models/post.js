var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var moment = require('moment');

var postSchema = new Schema(
    {
        title: {type: String, required: true},
        content: {type: String, required: true},
        time: {type: Date, default: Date.now},
        published: {type: Boolean, default: false}
    }
);

postSchema.virtual("url").get(function(){
    return "/posts/" + this._id;
});

postSchema
.virtual('ago')
.get(function () {

  const now = new Date();
  const nowMoment = moment(now);
  const pastMoment = moment(this.time);
  const timeAgoString = pastMoment.from(nowMoment); // 2 hours ago
  return timeAgoString;

});

module.exports = mongoose.model("Post", postSchema);