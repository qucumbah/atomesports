$(function() {
  let postPhrases = $(".changingTitle .post").children();
  postPhrases.hide();
  setTimeout(()=>changingTitle.start(postPhrases),100);

  stickyMenu.apply($(".menu"));

  setTimeout(()=>particles.start(),1);

  let scrollPaneContainer = $(".approved .container");
  setTimeout(()=>scrollPane.apply(scrollPaneContainer),100);

  let isLoggedIn = localStorage.getItem("isLoggedIn");
  if (isLoggedIn) {
    teamsHandler.addForm($(".recordForm__team"));
    viewersHandler.addForm($(".recordForm__viewer"));
  }
  teamsHandler.addScrollPane($(".approved .scrollPane"));

  $("#formAccess").hide();
  $(".record .forms").click(function() {
    if (!isLoggedIn) {
      $("#formAccess").show();
    }
  });
  $("#formNotLoggedIn").hide();
  $(".record .forms").children().submit(function(event) {
    event.preventDefault();
    if (!isLoggedIn) {
      $("#formNotLoggedIn").show();
    }
  });

  $(".burgerButton").click(function() {
    $(".menu .right").slideToggle(300, function() {
      if ($(this).css("display")=="none") {
        $(this).attr("style","");
      }
    });
  });

  loginHandler.apply($("#login"),$("#loginButton"));
});

/*
Принцип работы: вызываем метод, сворачивающий контейнер с заголовком; меняем
заголовок на следующий, разворачиваем обратно контейнер, ставим таймер
на следующее свёртывание
*/
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

      setTimeout(()=>extend(),400);
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
};

/*
Добавляет eventListener скролла страницы; если скролл=0, то добавляет класс
"прилипший" к меню (изменяет его цвет)
*/
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
};

/*
Принцип работы: создаётся канвас, отдельно в объекте particles хранится
некоторое количество координат и векторов движения частиц; каждые 15мс
отрисовываем сначала все частицы, затем линии, соединяющие близлежащие точки
в зависимости от расстояния между ними (ближе = толще линия)
*/
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
};

/*
При нажатии на кнопку прокручивает панель в одну из сторон внутри родительского
контейнера при помощи свойства css right
*/
let scrollPane = {
  apply(scrollPaneContainer) {
    this.scrollPaneContainer = scrollPaneContainer;

    let options = scrollPaneContainer.children(".options").children();
    let scrollPane = scrollPaneContainer.children(".scrollPaneWrapper").children();

    scrollPane.css("width",2*scrollPaneContainer.width());

    options.click(function() {
      options.removeClass("active");
      $(this).addClass("active");
      let n = $(this).index();
      scrollPane.stop().animate({
        right: n*scrollPaneContainer.width()+"px",
      });
    });
  }
};

/*
При отправке формы в локальное хранилище загружается объект со свойствами
команды; ссылка на объект хранится в формате __team*, где вместо * стоит
номер команды в порядке регистрации.
При загрузке страницы в заданные контейнеры добавляются bootstrap-карточки с
информацией о командах
*/
let teamsHandler = {
  addForm(form) {
    form.submit(function(event) {
      event.preventDefault();

      let teamName = $("#recordForm__teamName").val();
      let teamLogo = $("#recordForm__teamLogo").val();
      let teamDescription = $("#recordForm__teamDescription").val();
      let discipline = $("#recordForm__teamDiscipline").val();

      let team = {
        teamName,
        teamLogo,
        teamDescription,
        discipline
      };
      console.log(team);

      let nTeams;
      if (localStorage.getItem("nTeams")===undefined) {
        nTeams = 0;
      } else {
        nTeams = +localStorage.getItem("nTeams");
      }

      localStorage.setItem("__team"+nTeams, JSON.stringify(team));
      localStorage.setItem("nTeams", nTeams+1);
      location.reload();
    });
  },

  addScrollPane(scrollPane) {
    let nTeams = localStorage.getItem("nTeams");

    let csgoContainer = scrollPane.children(".csgo");
    let dotaContainer = scrollPane.children(".dota");

    for (let i = 0;i<nTeams;i++) {
      let team = JSON.parse(localStorage.getItem("__team"+i));

      let container = team.discipline=="csgo"?csgoContainer:dotaContainer;

      /*XMLHttpRequest: не получилось сделать проверку правильности ссылки,
      реквест от большинства серверов возвращал трудноуловимую ошибку;
      Вместо этого был картинкам добавлен атрибут onerror с обработкой ошибок
      //Проверяем, чтобы изображение было рабочим
      let request = new XMLHttpRequest();
      request.open("HEAD",team.teamLogo);
      request.onload = ()=>{
        //console.log(team.teamLogo);
        //console.log(request.status);

        let brokenLogo = request.status!=200 || !team.teamLogo;
        if (brokenLogo) {
          team.teamLogo = "img/atomLogo.png";
        }

        this.appendCard(
            container,team.teamName,team.teamLogo,team.teamDescription);
      };
      request.send();
      request.onerror = e=>{ //Проблема здесь
        console.log(e);
      };
      */
      this.appendCard(
          container,team.teamName,team.teamLogo,team.teamDescription);
    }
  },

  appendCard(container, name, logo, description) {
    container.append(`
      <div class="card" style="width: 15rem;">
        <img src="${logo}"  class="card-img-top" onerror="imgError(this);">
        <div class="card-body">
          <h5 class="card-title">${name}</h5>
          <p class="card-text">${description}</p>
        </div>
      </div>
    `);
  }
};

/*
Аналогичен teamsHandler, но не отображает зарегистрированных, а только добавляет
их в базу
*/
let viewersHandler = {
  addForm(form) {
    form.submit(function(event) {
      event.preventDefault();

      let viewerName = $("#recordForm__viewerName").val();
      let discipline = $("#recordForm__viewerDiscipline").val();

      let viewer = {
        viewerName,
        discipline
      };
      console.log(viewer);

      let nViewers;
      if (localStorage.getItem("nViewers")===undefined) {
        nViewers = 0;
      } else {
        nViewers = +localStorage.getItem("nViewers")
      }

      localStorage.setItem("__viewer"+nViewers, JSON.stringify(viewer));
      localStorage.setItem("nViewers", nViewers+1);
      location.reload();
    });
  }
};

/*
Вызывается когда html не смог прогрузить картинку из ссылки;
заменяет картинку на логотип
*/
function imgError(img) {
  img.onerror = "";
  img.src = "img/atomLogo.png";
}

/*
Отрисовываем нужную кнопку: если пользователь не залогинен - вход, иначе - выход
Проверяяет наличие логина и пароля в базе; если они совпадают со введёнными, то
ставим флаг isLoggedIn true;
*/
let loginHandler = {
  apply(form, sendButton) {
    $("#loginMenuButton").hide();
    $("#logoutMenuButton").hide();

    console.log(localStorage.getItem("isLoggedIn"));

    if (localStorage.getItem("isLoggedIn")) {
      $("#logoutMenuButton").show();
    } else {
      $("#loginMenuButton").show();
    }

    $("#logoutMenuButton").click(function() {
      localStorage.setItem("isLoggedIn","");
      location.reload();
    });

    localStorage.setItem("__loginadmin","admin");
    sendButton.click(function() {
      let username = $("#modalLogin").val();
      let password = $("#modalPassword").val();
      let successful = localStorage.getItem("__login"+username)==password;
      if (successful) {
        localStorage.setItem("isLoggedIn","1");
        location.reload();
      } else if (!this.errorMessageShown) {
        $(".modal-body").prepend(`
          <span style="color:red;">please try again</span>`);
        this.errorMessageShown = true;
      }
    });
  }
};
