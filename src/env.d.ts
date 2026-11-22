declare namespace App {
  interface Locals {
    person: import('./lib/db').Person | null;
  }
}
