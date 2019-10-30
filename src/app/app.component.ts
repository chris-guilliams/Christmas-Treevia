import { Component, OnInit, OnDestroy } from '@angular/core';
import * as p5 from 'p5';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Christmas-Treevia';
  private p5;

  constructor() {
    window.onresize = this.onWindowResize;
  }

  ngOnInit() {
    this.createCanvas();
  }

  ngOnDestroy(): void {
    this.destroyCanvas();
  }

  private onWindowResize = (e) => {
    this.p5.resizeCanvas(this.p5.windowWidth, this.p5.windowHeight);
  }

  private createCanvas = () => {
    this.p5 = new p5(this.drawing);
  }

  private destroyCanvas = () => {
    this.p5.noCanvas();
  }

  private drawing = function (p: any) {
    // f5 setup
    let inconsolata;
    p.preload = () => {
      inconsolata = p.loadFont('../assets/fonts/Montserrat-Black.otf');
    };

    p.setup = () => {
      p.createCanvas(1000, 1000, p.WEBGL).parent('canvas');
      p.textFont(inconsolata);
      p.textSize(p.width / 15);
      p.textAlign(p.CENTER, p.CENTER);
      p.background(0);
    };
    p.center = { x: 0, y: 0 };
    // f5 draw
    p.draw = () => {
      p.background(255);
      p.center.x = p.width / 2;
      p.center.y = p.height / 2;
      let time = p.millis();
      p.rotateX(time / 1000);
      p.rotateZ(time / 1234);
      p.fill(0, 0, 0);
      p.text('Christmas Treevia', 0, 0);
      p.push();
    };

  };
}
