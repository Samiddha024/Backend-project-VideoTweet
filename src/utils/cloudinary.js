import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if (!localfilepath) return null;

        // Upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        //console.log("File is uploaded on Cloudinary", response.url);
        fs.unlinkSync(localfilepath)
        return response;
    } catch (error) {
        console.log("Error in Cloudinary upload method:", error.message);

        // Check if localfilepath exists before attempting to delete
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath); // Remove the locally saved temporary file as the upload operation failed
            console.log("Removed local file:", localfilepath);
        } else {
            console.log("Local file not found:", localfilepath);
        }
    }
};

export { uploadOnCloudinary };
