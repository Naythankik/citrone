const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'assignment',
        required: [true, 'assignment is required'],
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'user is required'],
    },
    comment: String,
    answer: [{
        type: String,
        required: [true, 'answer is required'],
    }],
    notified: Boolean,
    default: false,
},
    { timestamps: true }
)

module.exports = mongoose.model('Submission', submissionSchema);
