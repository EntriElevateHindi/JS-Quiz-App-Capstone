let questions = [];
let result = [];
let number_of_questions = 0;
let current_question_number = 0;

const answer_status = [
    "UNATTEMPTED",
    "CORRECT",
    "INCORRECT"
]

async function getQuestions(url) {
    try {
        const response = await fetch(url);
        const status = response.status;

        if(status !== 200) {
            throw "Sorry, this is an invalid response!"
        }

        const response_text = await response.text();
        const response_obj = JSON.parse(response_text);
        return response_obj["questions"];
    } catch (err) {
        console.log(err);
    }
}

function renderQuestion(question_number) {
    modifyButtons(question_number);
    const question_body = questions[question_number];
    const question = question_body["question"];
    
    const question_number_container = document.getElementById("question-number-container");
    question_number_container.innerText = "Question number: " + (question_number + 1);

    const question_container = document.getElementById("question-container");
    question_container.innerText = question;

    if(result[question_number] === answer_status[0]) {
        const option_grid = document.getElementById("option-grid");
        option_grid.style.display = "grid";
        const message_container = document.getElementById("message");
        message_container.style.display = "none";

        const options = question_body["options"];

        const option_arr = ["A", "B", "C", "D"];

        for(let i = 0; i < option_arr.length; i++) {
            const option_id = option_arr[i];
            const option_container = document.getElementById(option_id);
            option_container.style.backgroundColor = "#ccc";
            option_container.innerText = option_id + ": " + options[i];

            option_container.addEventListener("click", ()=>{
                if(result[current_question_number] === answer_status[0]){
                    const selected_option = questions[current_question_number]["options"][i];
                    const correct_option = questions[current_question_number]["correctOption"];
                    if(selected_option === correct_option){
                        result[current_question_number] = answer_status[1];
                        option_container.style.backgroundColor = "green";
                    } else {
                        result[current_question_number] = answer_status[2];
                        option_container.style.backgroundColor = "red";
                    }
                }
            })
        }
    } else {
        const option_grid = document.getElementById("option-grid");
        option_grid.style.display = "none";
        const message_container = document.getElementById("message");
        message_container.style.display = "block";
        message_container.innerText = "Already attempted " + result[current_question_number] + "LY. Correct answer is: " + questions[current_question_number]["correctOption"];
    }
}

document.addEventListener("DOMContentLoaded", async() => {
    const url = "http://localhost:5500/questions.json";

    questions = await getQuestions(url);
    number_of_questions = questions.length;
    
    if(number_of_questions > 0) {
        result = Array(number_of_questions).fill(answer_status[0]);
        renderQuestion(current_question_number);
    }
});

const next = document.getElementById("next-button");
next.addEventListener("click", ()=>{
    if(current_question_number < number_of_questions - 1){
        current_question_number += 1;
    }
    renderQuestion(current_question_number);
})


const previous = document.getElementById("previous-button");
previous.addEventListener("click", ()=>{
    if(current_question_number > 0){
        current_question_number -= 1;
    }
    renderQuestion(current_question_number);
})

const submit = document.getElementById("submit-button");
submit.addEventListener("click", testSubmit);

function testSubmit() {
    const total = number_of_questions;
    const correct = result.filter((item) => {
        return item === answer_status[1];
    }).length;

    let outcome = "";

    if(correct / total >= 0.6){
        outcome = "PASSED";
    } else {
        outcome = "FAILED";
    }

    const quiz_container = document.querySelector(".container");
    quiz_container.style.display = "none";
    const result_container = document.getElementById("result-message");
    result_container.style.display = "block";
    result_container.innerText = "Result is: " + correct + "/" + total + ". You have " + outcome + ".";
}

function modifyButtons(current_question_number) {
    if(current_question_number === 0) {
        previous.style.display = "none";
    } else {
        previous.style.display = "flex";
    }

    if(current_question_number === number_of_questions - 1) {
        next.style.display = "none";
        submit.style.display = "flex";
    } else {
        next.style.display = "flex";
        submit.style.display = "none";
    }
}
