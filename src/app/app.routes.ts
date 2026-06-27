import { Routes } from '@angular/router';
import { Room } from './components/room/room';
import { Read } from './components/read/read';
import { Done } from './components/done/done';

export const routes: Routes = [
    { path: 'room/:code', component: Room },
    { path: 'read', component: Read },
    { path: 'done', component: Done },
    { path: '**', redirectTo: '' }
];
