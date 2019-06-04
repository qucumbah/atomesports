$(()=>{
  let postPhrases = $(".changingTitle .post").children();
  changingTitle.start(postPhrases);

  stickyMenu.apply($(".menu"));
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
