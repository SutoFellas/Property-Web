import { createRouter, createWebHistory } from 'vue-router';
import Home from './pages/Home.vue';
import Admin from './pages/Admin.vue';
import ManageListings from './pages/ManageListings.vue';
import ListingDetail from './pages/ListingDetail.vue';
import About from './pages/About.vue';
import Contact from './pages/Contact.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/admin/manage-listings',
    name: 'ManageListings',
    component: ManageListings
  },
  {
    path: '/listing/:id',
    name: 'ListingDetail',
    component: ListingDetail,
    props: true
  },
  {
    path: '/hakkimizda',
    name: 'About',
    component: About
  },
  {
    path: '/iletisim',
    name: 'Contact',
    component: Contact
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 