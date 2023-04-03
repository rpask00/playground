import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, debounceTime, filter, scan, Subject, takeUntil} from "rxjs";

class Button {
  public letters: string[]
  private index = 0;

  constructor(letters: string[]) {
    this.letters = letters
  }

  next() {
    return this.letters[this.index++ % this.letters.length]
  }

  reset() {
    this.index = 0
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$: Subject<void> = new Subject<void>();

  private recentlyPressed$ = new BehaviorSubject<null | Button>(null)

  buttons: Button[] = [
    new Button(['a', 'b', 'c']),
    new Button(['d', 'e', 'f']),
    new Button(['g', 'h', 'i']),
    new Button(['j', 'k', 'l']),
    new Button(['m', 'n', 'o']),
    new Button(['p', 'q', 'r', 's']),
    new Button(['t', 'u', 'v']),
    new Button(['w', 'x', 'y', 'z']),
  ]

  button$ = new Subject<Button>()
  text$ = this.button$.pipe(
    scan((acc, currentlyPressed) => {
      const recentlyPressed = this.recentlyPressed$.getValue()

      if (recentlyPressed === currentlyPressed) {
        acc = acc.slice(0, -1) + currentlyPressed.next()
      } else {
        acc = acc + currentlyPressed.next()
        recentlyPressed?.reset()
      }

      this.recentlyPressed$.next(currentlyPressed)

      return acc


    }, ''))


  ngOnInit() {
    this.recentlyPressed$.pipe(
      takeUntil(this.destroy$),
      debounceTime(1000), filter(button => button !== null))
      .subscribe(() => {
        this.recentlyPressed$.value?.reset()
        this.recentlyPressed$.next(null);
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
