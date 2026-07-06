import { Routes } from '@angular/router';
import { Room } from './components/room/room';
import { Read } from './components/read/read';
import { Done } from './components/done/done';
import { Feedbacks } from './components/feedbacks/feedbacks';

export const routes: Routes = [
    { path: 'room/:code', component: Room },
    { path: 'read', component: Read },
    { path: 'done', component: Done },
    { path: 'feedbacks', component: Feedbacks },
    { path: '**', redirectTo: '' }
];
