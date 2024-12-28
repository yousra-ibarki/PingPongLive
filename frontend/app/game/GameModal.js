// import React from 'react';
// import { Dialog, DialogContent } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Trophy } from 'lucide-react';

// export const GameEndModal = ({ isOpen, winner, playerName, onClose }) => {
//   const isWinner = winner === playerName;

//   return (
//     {}
    // <Dialog open={isOpen} onOpenChange={onClose}>
    //   <DialogContent className="sm:max-w-md">
    //     <div className="flex flex-col items-center gap-4 p-6">
    //       <Trophy size={64} className={isWinner ? "text-yellow-400" : "text-gray-400"} />
    //       <h2 className="text-2xl font-bold text-center">
    //         {isWinner ? "Victory!" : "Game Over"}
    //       </h2>
    //       <p className="text-center text-lg">
    //         {isWinner 
    //           ? "Congratulations! You've won the game!" 
    //           : "Better luck next time!"}
    //       </p>
    //       <Button onClick={() => window.location.href = "/home"} className="mt-4">
    //         Return to Home
    //       </Button>
    //     </div>
    //   </DialogContent>
    // </Dialog>
//   );
// };

// export default GameEndModal;