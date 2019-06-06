$(function() {
  let postPhrases = $(".changingTitle .post").children();
  postPhrases.hide();
  setTimeout(()=>changingTitle.start(postPhrases),100);

  stickyMenu.apply($(".menu"));

  setTimeout(()=>particles.start(),1);

  //formHandler.apply();

  let scrollPaneContainer = $(".approved .container");
  setTimeout(()=>scrollPane.apply(scrollPaneContainer),100);
});

let changingTitle = {
  start(elements) {
    let cur = 0;
    let numberOfElements = elements.length;

    /*
    Для каждого из слов, которые изменяются, добавим в заголовок свой стиль с их
    шириной (тк width: auto не анимируется автоматически)
    */
    for (let i = 0;i<numberOfElements;i++) {
      elements.eq(i).show();
      setTimeout(()=>{
        let w = elements.eq(i).width()+22; //22 = padding + line
        //console.log(w);
        elements.eq(i).hide();
        $(`<style>
          .__titleExtended${i} {
            width: ${w}px;
          }
        </style>`).appendTo("head");
      },100);
    }

    //Стиль для момента, когда слово пропадает
    $(`<style>
      .__titleContracted {
        width: 2px;
      }
    </style>`).appendTo("head");

    function contract() {
      /*
      Стандартный метод jquery .animate багался, когда пользователь переключался
      на другую вкладку: весь js шёл как должен, а jquery не показывал анимации,
      вследствие чего они копились в стеке и после переключения обратно на
      страницу проигрывались все сразу без остановки на высокой скорости.
      Из-за этого используется анимация классами
      */
      /*Старый способ: рабочий, но багнутый
      $(".post").animate({
        width: "2px"
      },400);
      */
      $(".post").removeClass(`__titleExtended${cur}`);
      $(".post").addClass("__titleContracted");


      setTimeout(()=>extend(),400)
    }
    function extend() {
      elements.eq(cur).hide();
      cur = (cur+1)%numberOfElements;
      elements.eq(cur).show();
      /*
      $(".post").animate({
        width: elements.eq(cur).width()+22
      },400);
      */
      $(".post").removeClass("__titleContracted");
      $(".post").addClass(`__titleExtended${cur}`);
      setTimeout(()=>contract(),2000);
    }

    contract();
  }
}

let stickyMenu = {
  apply(elem) {
    $(document).scroll(function() {
      if ($(this).scrollTop()!=0 && elem.hasClass("sticky")) {
        elem.removeClass("sticky");
      } else if ($(this).scrollTop()==0 && !elem.hasClass("sticky")) {
        elem.addClass("sticky");
      }
    });
  }
}

let particles = {
  start() {
    this.createCanvas();
    this.createParticles();
    setInterval(()=>this.draw(),15);

    this.canvas.mousemove(e=>{
      this.mouseX = e.pageX;
      this.mouseY = e.pageY;
    });
  },

  createCanvas() {
    //изменяются позже, начальное значение чтобы запустилось
    this.width = document.body.clientWidth;
    this.height = screen.height;
    this.canvas = $('<canvas id="canvas" />').attr({
      width: this.width,
      height: this.height
    }).appendTo(".header");
    this.ctx = this.canvas.get(0).getContext("2d");
    this.numberOfParticles = 40;
  },

  updateDimensions() {
    /*
    При каждом изменении разрешения генерируем новый канвас, чтобы концентрация
    частиц всегда оставалась неизменной
    */
    let newHeight = $(".header").height();
    let newWidth = document.body.clientWidth;
    if (newHeight!=this.height || newWidth!=this.width) {
      this.height = newHeight;
      this.width = newWidth;
      this.canvas.attr("height",this.height);
      this.canvas.attr("width",this.width);
      this.createParticles();
    }
  },

  createParticles() {
    //Поставим примерно одинаковую концентрацию частиц для любого разрешения
    this.numberOfParticles = 6e-5*this.width*this.height;
    //this.numberOfParticles = 40;
    console.log(this.numberOfParticles);
    this.points = [];
    for (let i = 0;i<this.numberOfParticles;i++) {
      let amplitude = 3;
      this.points[i] = {
        x: Math.random()*this.width,
        y: Math.random()*this.height,
        dx: amplitude*(Math.random()-0.5),
        dy: amplitude*(Math.random()-0.5)
      };
    }
  },

  draw() {
    this.updateDimensions();

    this.ctx.clearRect(0,0,this.width,this.height);

    for (let i = 0;i<this.numberOfParticles;i++) {
      let {x,y,dx,dy} = this.points[i];

      //Отрисовываем саму частицу
      this.ctx.beginPath();
    	this.ctx.arc(x, y, 2, 0, 2*Math.PI, false);
    	this.ctx.fillStyle = 'white';
    	this.ctx.fill();

      //Движение
      this.points[i].x+=dx;
      this.points[i].y+=dy;

      //Отталкивание от стенок
      if (x<0) {
        this.points[i].dx = Math.abs(dx);
      } else if (x>this.width) {
        this.points[i].dx = -Math.abs(dx);
      }
      if (y<0) {
        this.points[i].dy = Math.abs(dy);
      } else if (y>this.height) {
        this.points[i].dy = -Math.abs(dy);
      }

      //Отрисовываем линии (только если квадрат расстояния между ними <50000)
      let minDist = 50000;
      for (let j = 0;j<this.numberOfParticles;j++) {
        let diffX = x - this.points[j].x;
        //console.log(diffX);
        let diffY = y - this.points[j].y;
        let dist = diffX*diffX + diffY*diffY;

        if (dist>minDist) {
          continue;
        }

        //Доля от максимального квадрата удалённости
        let tone = (minDist-dist)/minDist;
        this.ctx.lineWidth = 2*tone;
        this.ctx.strokeStyle=`rgba(255,255,255,${0.5*tone})`;
        //Сама линия
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(this.points[j].x, this.points[j].y);
        this.ctx.stroke();
      }
    }
  }
}

let scrollPane = {
  apply(scrollPaneContainer) {
    this.scrollPaneContainer = scrollPaneContainer;

    let options = scrollPaneContainer.children(".options").children();
    let scrollPane = scrollPaneContainer.children(".scrollPaneWrapper").children();

    scrollPane.css("width",2*scrollPaneContainer.width());

    options.click(function() {
      options.removeClass("active");
      $(this).addClass("active");
      let n = $(this).index(options);
      console.log(n);
      scrollPane.animate({
        right: -n*scrollPaneContainer.width()+"px",
      });
    });
  }
}
