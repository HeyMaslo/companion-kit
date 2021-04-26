import { IBackendController } from "common/abstractions/controlllers/IBackendController";
import { 
    QolSurveyResults,
    PartialQol
} from "common/models/QoL";

export default class TestBackendControllerBase implements IBackendController {

    // State to test first-time use
    /*
    private _partialQolState: PartialQol = null;
    private _surveyResults: QolSurveyResults[] = [];
    */

    // Normal State
    
    // private _partialQolState: PartialQol = {questionNum: 3, domainNum: 0, scores: {
    //     "physical": 15,
    //     "sleep": 0,
    //     "mood": 0,
    //     "cognition": 0,
    //     "leisure": 0,
    //     "relationships": 0,
    //     "spiritual": 0,
    //     "money": 0,
    //     "home": 0,
    //     "self-esteem": 0,
    //     "independence": 0,
    //     "identity": 0,
    //     }, isFirstTimeQol: false};
    private _partialQolState: PartialQol = null;
    private _surveyResults: QolSurveyResults[] = [
        { 
         "physical": 18,
         "sleep": 20,
         "mood": 20,
         "cognition": 20,
         "leisure": 6,
         "relationships": 20,
         "spiritual": 4,
         "money": 20,
         "home": 20,
         "self-esteem": 8,
         "independence": 20,
         "identity": 20,
        }
    ];
    
    

    // Fetch the latests survey results (i.e. scores)
    public async getSurveyResults(): Promise<QolSurveyResults> {
        if (this._surveyResults.length === 0) { return null; }
        return this._surveyResults[this._surveyResults.length-1];
    }

    // Submit new survey results
    public async sendSurveyResults(results: QolSurveyResults): Promise<boolean> {
        this._surveyResults.push(results);
        return true;
    }

    // Store partial survey state
	// Any subsequent calls to get will return this state
    public async sendPartialQol(surveyScores: QolSurveyResults,
        questionNumber: number, domainNumber: number, firstTimeQol: boolean): Promise<boolean> {
        if (surveyScores === null) {
            this._partialQolState = null;
        } else {
            this._partialQolState = {questionNum: questionNumber, domainNum: domainNumber, scores: surveyScores, isFirstTimeQol: firstTimeQol};
        }
        return true;
    }

    // Get last stored state
	// null value indicates no outstanding survey
    public async getPartialQol(): Promise<PartialQol> {
        return this._partialQolState;
    }

    public setUser(userId: string) {
        console.log(`user id: ${userId}`)
    }

}