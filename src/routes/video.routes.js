import {Router} from "express"
import {getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );


// router.route("/").get(getAllVideos);


 router.route("/:videoId").get(getVideoById)
 router.route("/:videoId").patch(upload.single("thumbnail"),updateVideo).delete(deleteVideo)
router.route("/:videoId/toggel-Publish").patch(togglePublishStatus)

export default router ;