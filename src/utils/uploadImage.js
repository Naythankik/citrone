const cloudinary = require("../../config/cloudinary");

const uploadImage = async (filename, uploadname) => {
  let response;
  try {
    const result = await cloudinary.uploader.upload(filename, {
      public_id: uploadname,
    });

    response = result;
  } catch (error) {
    response = error;
  }
  return response;
};

module.exports = {
  uploadImage,
};
