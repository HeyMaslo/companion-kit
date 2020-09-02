import type { google } from '@google-cloud/vision/build/protos/protos';
import { WordReference } from 'common/models/WordReference';

type IAnnotateImageResponse = google.cloud.vision.v1.IAnnotateImageResponse;
type IFaceAnnotation = google.cloud.vision.v1.IFaceAnnotation;
type IEntityAnnotation = google.cloud.vision.v1.IEntityAnnotation;

export type VisionRecognition = Pick<IAnnotateImageResponse, any>;

export namespace VisionRecognition {
    export function fromVisionRecognition(vision: VisionRecognition): Array<WordReference> {
        const wordReferenceFromFace = getFaceAnnotation(vision.faceDetection);
        const wordReferenceFromLabel = getLabelAnnotation(vision.labelAnnotations);
        return wordReferenceFromFace.length ? wordReferenceFromFace : wordReferenceFromLabel;
    }
    function getFaceAnnotation(faces: Array<IFaceAnnotation>): Array<WordReference> {
        const facesObject: any = {};
        faces?.forEach(face => {
            const f = getFaces(face);
            facesObject[f] = facesObject[f] ? facesObject[f] + 1 : 1;
        });
        return Object.keys(facesObject).map(key => {
            return {
                value: key,
                count: facesObject[key],
                sentiment: null,
                categories: [],
            };
        });
    }
    function getLabelAnnotation(labels: Array<IEntityAnnotation> = []): Array<WordReference> {
        const reference: Array<WordReference> = [];
        if (labels.length) {
            labels.forEach(label => {
                reference.push({
                    value: label.description,
                    count: 1,
                    sentiment: null,
                    categories: [],
                });
            });
        }
        return reference;
    }
    function getFaces(face: IFaceAnnotation): string {
        if (face.joyLikelihood === 'VERY_LIKELY') {
            return 'joy';
        }
        if (face.angerLikelihood === 'VERY_LIKELY') {
            return 'anger';
        }
        if (face.surpriseLikelihood === 'VERY_LIKELY') {
            return 'surprise';
        }
        if (face.sorrowLikelihood === 'VERY_LIKELY') {
            return 'sorrow';
        }
    }
}
