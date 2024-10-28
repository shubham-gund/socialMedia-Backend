import { Schema, model, Document } from 'mongoose';

interface INotification extends Document {
  from: Schema.Types.ObjectId;
  to: Schema.Types.ObjectId;
  type: 'follow' | 'like';
  post?: Schema.Types.ObjectId;
  read?: boolean;
}

const notificationSchema = new Schema<INotification>({
  from: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['follow', 'like']
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: function() { return (this as INotification).type === 'like'; }
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
