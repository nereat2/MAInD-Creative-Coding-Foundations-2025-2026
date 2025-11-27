const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;
console.log(width, height)

canvas.width = width;
canvas.height = height; 

const size = 200; 

let circlePos = height / 2;

function draw() {

    console.log('Ciao')

    ctx.fillStyle = 'black';
        ctx.font = '40px Arial';
        ctx.fillText('Ciao', 100, 100);

    
    ctx.clearRect(0,0, width, height); // this will clear the path that the circle does while going down 

    if (circlePos > height + 80){ // adding the radius makes it go down all the way to the end of the circle instead of just stopping at the center 
        circlePos = height / 2;
        // circlePos = -80; this would make the circle just fall in loop also from above the rectangle, without starting from the center of this last one
    } // this condition makes it restart when the center of the circle gets to the end of the screen 

    circlePos += 5; // this will make the animation go faster

        ctx.fillStyle = 'blue';
        ctx.fillRect(width/2 - size/2, height/2 - size/2, size, size); // width/2 - size/2, height/2 - size/2 

        
        ctx.beginPath();
        ctx.fillStyle = 'orange'; 
        ctx.arc(width/2, circlePos, 80, 0, Math.PI * 2); //width / 2, height / 2
        ctx.fill();

    ctx.restore(); // always do this at the end of my movements to the original one, otherwise if we include more elements and it misses the original coordinates could be a mess 

    requestAnimationFrame(draw);

}

draw();



   
//ctx.fillStyle = 'black';
   // ctx.font = '40px Arial';
   // ctx.fillText('Ciao', 100, 100);

   // ctx.save();
   // ctx.translate(width/2, height/2);

   // this is not mandatory to add in the final assignment 
   