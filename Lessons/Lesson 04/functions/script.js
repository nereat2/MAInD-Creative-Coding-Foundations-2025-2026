
function fullName(name, surname) {
    return "Name: " + name + ", Surname: " + surname;
}

function  printInfo(name, surname, course) {
    console.log(fullName(name, surname) + ", course:" + course);
}

function  printGrades(name, surname, grade) {
    console.log(fullName(name, surname) + ", grade:" + grade);
}

printInfo("Marco", "Lurati", "Coding");
printGrades("Marco", "Lurati", 4);
