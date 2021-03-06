import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Meetups from '@/components/meetup/Meetups'
import CreateMeetup from '@/components/meetup/CreateMeetup'
import Profile from '@/components/user/Profile'
import SignUp from '@/components/user/SignUp'
import SignIn from '@/components/user/SignIn'
import Meetup from '@/components/meetup/Meetup'
import AuthGuard from './auth-guard'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home
        },
        {
            path: '/meetups',
            name: 'Meetups',
            component: Meetups
        },
        {
            path: '/meetup/new',
            name: 'CreateMeetup',
            component: CreateMeetup,
            beforeEnter: AuthGuard
        },
        {
            path: '/meetups/:id',
            name: 'Meetup',
            props: true,
            component: Meetup
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile,
            beforeEnter: AuthGuard
        },
        {
            path: '/signUp',
            name: 'SignUp',
            component: SignUp
        },
        {
            path: '/signin',
            name: 'SignIn',
            component: SignIn
        }
    ],
    mode: 'history'
})
