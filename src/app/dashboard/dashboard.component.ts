import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  

  public form = new FormGroup(
    {
      username: new FormControl('Minatone', [Validators.required]),
      tagline: new FormControl('br1', [Validators.required]),
      soupig: new FormControl(false, [Validators.required]),
    }
  );

  public headers = environment.headers;
  public baseUrl = environment.baseUrl2;
  public puuid: any;
  public partidas: any;
  public detalhesPartidas: any;
  public loading:boolean = false;
  public fase:number = 1;

  constructor(public http: HttpClient) {
  }

  ngOnInit(): void {
  }


  getPlayer() {
    this.loading = true;
    console.log(this.form.value);
    this.http.get(`${this.baseUrl}/riot/account/v1/accounts/by-riot-id/` + this.form.controls['username'].value + '/' + this.form.controls['tagline'].value, { headers: this.headers }).subscribe((res: any) => {
      this.puuid = res.puuid;
      console.log(res);
      this.getPartidas();
    }, (err) => {
      console.log(err);
    });
  }

  getPartidas() {
    this.http.get(`${this.baseUrl}/lol/match/v5/matches/by-puuid/` + this.puuid + `/ids`, { headers: this.headers }).subscribe((res: any) => {
      console.log(res);
      this.partidas = res;
      this.getPartidasLoop();
    }, (err) => {
      console.log(err);

    });
  }

  getPartidasLoop() {
    this.detalhesPartidas = [];
    const tempDetalhesPartidas: any[] = new Array(this.partidas.length).fill(null);
    let completedRequests = 0;
  
    this.partidas.forEach((partida: any, index: number) => {
      this.http.get(`${this.baseUrl}/lol/match/v5/matches/` + partida, { headers: this.headers }).subscribe((res: any) => {
        const participant = res.info.participants.find((p: any) => p.puuid === this.puuid);
        if (participant) {
          tempDetalhesPartidas[index] = participant;
        }
        completedRequests++;
        if (completedRequests === this.partidas.length) {
          this.detalhesPartidas = tempDetalhesPartidas.filter(item => item !== null);
          console.log('filtro', this.detalhesPartidas);
          this.loading = false;
          this.fase = 2;
        }
      }, (err) => {
        console.log(err);
        completedRequests++;
        if (completedRequests === this.partidas.length) {
          this.detalhesPartidas = tempDetalhesPartidas.filter(item => item !== null);
          console.log('filtro', this.detalhesPartidas);
          this.loading = false;
          this.fase = 2;
        }
      });
    });
  }

  getChampionSplashArtUrl(championName: string, skinNumber: number = 0): string {
    // Formata o nome do campeão com a primeira letra maiúscula
    // const formattedChampionName = championName.charAt(0).toUpperCase() + championName.slice(1).toLowerCase();

    // URL base das splash arts dos campeões na CDN da Riot Games
    const baseUrl = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/";

    // Monta a URL completa para a splash art
    return `${baseUrl}${championName}_${skinNumber}.jpg`;
  }

  final(status:boolean) {
    if (status) {
      return 'https://i.imgur.com/fuxho0I.png';
    } else {
      return 'https://i.imgur.com/ldaKYgd.png';
    }
  }


  calculadora(item:any) {
    let kills = item.kills;
    let deaths = item.deaths;
    let assists = item.assists;

    let kda = (kills + (assists / 2)) / deaths;

    if (isNaN(kda)) {
      kda = 0;
    }

    if (kda > 1) {
      return 'https://i.imgur.com/0GKj5MO.png';
    } else if (kda < 1) {
      return 'https://i.imgur.com/sJJhFVs.png';
    } else {
      return 'https://i.imgur.com/bCsuo8S.png';
    }

  }

  kda(item:any) {
    let kills = item.kills;
    let deaths = item.deaths;
    let assists = item.assists;

    return kills + '/' + deaths + '/' + assists;
  }

}
