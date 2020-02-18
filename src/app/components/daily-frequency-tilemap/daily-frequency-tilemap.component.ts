import { Component, OnInit, Input, ViewChild, ElementRef, ViewEncapsulation, AfterViewInit, Renderer, Renderer2 } from '@angular/core';
import { Timestamp } from '@google-cloud/firestore';
import * as d3 from 'd3';
import { AngularFirestore } from '@angular/fire/firestore';
@Component({
  selector: 'app-daily-frequency-tilemap',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './daily-frequency-tilemap.component.html',
  styleUrls: ['./daily-frequency-tilemap.component.scss']
})
export class DailyFrequencyTilemapComponent implements OnInit, AfterViewInit {

  constructor(private db: AngularFirestore, private renderer: Renderer2, private elem: ElementRef) { }

  @Input() timestamps: {when: Timestamp}[];
  plays: Timestamp[];
  playsByHour: { [key: string]: {hour: number, count: number}[]};
  dates: Date[];
  dayCounts: { [key: string]: {
      count: number,
      date: Date
    }
  } = {};
  currentDate: { count: number, date: Date } = { count: 0, date: new Date() };
  margin = { top: 10, right: 10, bottom: 10, left: 40 };
  width = 720 - this.margin.left - this.margin.right;
  height = 550 - this.margin.top - this.margin.bottom;
  gridSize = Math.floor(this.width / 24);
  cellSize = 100;
  timeWeek = d3.utcSunday;
  myHeavyFunction: () => void;
  objectKeys = Object.keys;
  legendElementWidth = this.gridSize * 2;
  buckets = 9;
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  weeks = [''];
  times = ['1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a',
    '10a', '11a', '12a', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p'];

  maxValue = 62; // max frequency per day from dataset
  minValue = 0;
  colorFn = d3.scaleSequential(d3.interpolateBlues).domain([this.minValue, this.maxValue]);

  categoriesCount = 9;
  categories = [...Array(this.categoriesCount)].map((_, i) => {
    const upperBound = this.maxValue / this.categoriesCount * (i + 1);
    const lowerBound = this.maxValue / this.categoriesCount * i;
    return {
      upperBound,
      lowerBound,
      color: d3.interpolateBlues(upperBound / this.maxValue)
    };
  });

  mockData = [
    {hour: 0, count: 20},
    {hour: 1, count: 20},
    {hour: 2, count: 20},
    {hour: 3, count: 20},
    {hour: 4, count: 20},
    {hour: 5, count: 20},
    {hour: 6, count: 20},
    {hour: 7, count: 20},
    {hour: 8, count: 20},
    {hour: 9, count: 20},
    {hour: 10, count: 20},
    {hour: 11, count: 20},
    {hour: 12, count: 20},
    {hour: 13, count: 7},
    {hour: 14, count: 20},
    {hour: 15, count: 20},
    {hour: 16, count: 20},
    {hour: 17, count: 20},
    {hour: 18, count: 20},
    {hour: 19, count: 20},
    {hour: 20, count: 20},
    {hour: 21, count: 20},
    {hour: 22, count: 20},
    {hour: 23, count: 20},
  ];

  svg;
  color;
  tooltip;

  ngOnInit() {
    this.startGame();
  }

  ngAfterViewInit() {
    this.addXAxesToCards();
    this.addYAxesToCards();
    this.addBarsToCards();
  }

  startGame() {
    this.db.collection('triviaPlays').valueChanges().subscribe((change: {when: Timestamp}[]) => {
      this.timestamps = change;
      this.plays =  this.timestamps.map((timestamp => timestamp.when));
      this.playsByHour = this.sortPlaysByHour(this.plays);
      this.createChart();
      this.createTooltip();
      this.appendSVG();
      this.buildDayLabels();
      this.buildDays();
    });
  }

  private createChart() {
    this.dates = this.timestamps.map(timestamp => timestamp.when.toDate());
    this.dates = this.dates.sort((a, b) => {
      return a.valueOf() - b.valueOf();
    });
    for (const date of this.dates) {
      if (!this.dayCounts[date.toDateString()]) {
        this.dayCounts[date.toDateString()] = {
            count: this.dates.filter(day => {
                return day.toDateString() === date.toDateString();
              }).length,
            date
        };
      }
    }
    this.dayCounts[new Date('Sat Dec 07 2019').toDateString()] = {
      count: 0,
      date: new Date('Sat Dec 07 2019')
    };
    this.dayCounts[new Date('Sat Dec 03 2019').toDateString()] = {
      count: 0,
      date: new Date('Sat Dec 03 2019')
    };
  }

  appendSVG() {
    this.svg = d3.select('#chart').append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
    this.svg.on('mousemove', (d) => {
      this.updateTooltip(this.currentDate.date, this.currentDate.count);
    });
    this.svg.on('click', (d) => {
      this.scrollDayIntoView(this.currentDate.date);
    });
  }

  updateTooltip(day: Date, plays: number) {
    const currentDateString = (day.getMonth() + 1) + '/' + day.getDate() + '/' + day.getFullYear();
    d3.select('div.tooltip').html(currentDateString + '<br/>plays: '  + plays)
      .style('left', (d3.event.pageX) + 5 + 'px')
      .style('top', (d3.event.pageY - 65) + 'px')
      .style('font-family', '\'Titillium Web\', sans-serif');
  }

  scrollDayIntoView(day: Date) {
    const dayChartId = day.toDateString().split(' ').join('-');
    this.getPlaysForDay(day);
    (document.getElementById(dayChartId) as HTMLElement).scrollIntoView({behavior: 'smooth', block: 'end', inline: 'center'});
  }

  buildDayLabels() {
    this.svg.selectAll('.dayLabel')
      .data(this.days)
      .enter()
      .append('g')
        .attr('transform', 'translate(0,' + this.cellSize / 1.5 + ')')
      .append('text')
        .text((d) => d)
        .classed('rotation', true)
        .attr('fill', 'black')
        .attr('transform', (d , i) => {
          return 'translate(' + ((this.cellSize * i) + 15) + ', 25),' + 'rotate(-45)';
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('font-size', '22px')
        .attr('font-family', '\'Titillium Web\', sans-serif');
  }

  buildTimeLabels() {
    this.svg.selectAll('.timeLabel')
      .data(Object.keys(this.dayCounts))
      .enter().append('text')
        .text(d => d)
        .attr('x', -100)
        .attr('y', (d, i) => i * this.gridSize)
        .style('text-anchor', 'middle')
        .attr('transform', () => 'translate(' + this.gridSize / 2 + ', -6)');
  }

  buildDays() {
    this.svg.append('g')
      .selectAll('rect')
      .data(Object.values(this.dayCounts))
      .join('rect')
      .attr('width', this.cellSize - 7)
      .attr('height', this.cellSize - 7)
      .attr('y', (d, i) => (this.timeWeek.count(d3.utcYear(d.date), d.date) - 46) * this.cellSize + 10)
      .attr('x', d => (this.countDay(d.date) * this.cellSize + 0.5) - 25)
      .attr('fill', d => this.colorFn(d.count))
      .attr('rx', '4')
      .attr('stroke', 'black')
      .attr('class', 'cell')
      .on('mouseover', (d) => {
        this.currentDate = d;
        d3.selectAll('div.tooltip').transition()
          .duration(400)
          .style('opacity', .9);
      })
      .on('mouseout', (d) => {
        d3.selectAll('div.tooltip').transition()
        .duration(500)
        .style('opacity', 0);
      });
  }

  buildColorScale() {
    this.color = d3.scaleLinear()
      .range(['white', '#69b3a2'])
      .domain([1, 100]);
  }

  countDay(d): number {
    return d.getUTCDay();
  }

  createTooltip() {
    this.tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
  }

  getPlaysForDay(day: Date): Date[] {
    return this.dates.filter(date => date.toDateString() === day.toDateString());
  }

  addXAxisToCard(id: string) {
    const width = 440;
    const height = 250;
    const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    // Append SVG
    const svg = d3.select('#' + id)
                .append('svg')
                .attr('width', width)
                .attr('height', height);

    // Create scale
    const scale = d3.scaleBand()
                  .domain(data)
                  .range([0, width - 40]);

    // Add scales to axis
    const xAxis = d3.axisBottom(scale).tickSizeOuter(0);

    // Append group and insert axis
    svg.append('g')
      .call(xAxis)
      .attr('transform', 'translate(22.25,' + (height - 80) + ')');
  }

  addXAxesToCards() {
    const elArr = document.getElementsByClassName('day-card');
    setTimeout(() => {
      Array.prototype.forEach.call(elArr, (element) => {
        this.addXAxisToCard(element.id);
      });
    }, 1500);
  }

  addYAxisToCard(id: string) {
    const width = 440;
    const height = 250;
    const data = [40];

    // Append SVG
    const svg = d3.select('#' + id + ' svg')
                .attr('width', width)
                .attr('height', height);

    // Create scale
    const scale = d3.scaleLinear()
                  .domain([d3.max(data), 0])
                  .range([0, 170]);

    // Add scales to axis
    const yAxis = d3.axisLeft()
                  .scale(scale);

    // Append group and insert axis
    svg.append('g')
      .call(yAxis)
      .attr('transform', 'translate(30,0)');
  }

  addYAxesToCards() {
    const elArr = document.getElementsByClassName('day-card');
    setTimeout(() => {
      Array.prototype.forEach.call(elArr, (element) => {
        this.addYAxisToCard(element.id);
      });
    }, 1500);
  }

  addBarsToCard(id: string, data: {hour: number, count: number}[]) {
    const width = 440;
    const height = 170;
    const x = d3.scaleBand()
      .range([0, width - 40])
      .padding(0.2);
    const y = d3.scaleLinear()
      .domain([0, 40])
      .range([0, height]);
    x.domain(data.map((d) =>  d.hour));
    const svg = d3.select('#' + id + ' svg');
    svg.selectAll('bar')
      .data(data)
      .enter().append('rect')
      .style('fill', 'steelblue')
      .attr('x', (d) => (x(d.hour) + 30))
      .attr('width', x.bandwidth())
      .attr('y', (d) => height - y(d.count))
      .attr('height', (d) => y(d.count));
  }

  addBarsToCards() {
    const elArr = document.getElementsByClassName('day-card');
    setTimeout(() => {
      Array.prototype.forEach.call(elArr, (element) => {
        this.addBarsToCard(element.id, this.mockData);
      });
    }, 1500);
  }

  // getHourDataForCard(id: string): {hour: number, count: number}[] {

  // }

  sortPlaysByHour(plays: Timestamp[]): { [key: string]: { hour: number, count: number }[] } {
    let playsSortedByHour: { [key: string]: { hour: number, count: number }[] } = {};
    console.log(plays);
    for ( const play of plays) {
      console.log(play.toDate().toDateString());
      const playDateString = play.toDate().toDateString();
      const playHour = play.toDate().getHours();
      if (playsSortedByHour[playDateString] && playsSortedByHour[playDateString].some(hourCount => hourCount.hour === playHour)) {
        // playsSortedByHour[playDateString] = [{hour: play.toDate().getHours(), count: 1}];
      } else {
        playsSortedByHour[playDateString] = [{hour: play.toDate().getHours(), count: 1}];
      }
    }
    console.log(playsSortedByHour);
    return playsSortedByHour;
  }
}
