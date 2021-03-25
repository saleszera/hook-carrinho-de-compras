import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {           
      const productStock = await api.get<Stock>(`stock/${productId}`)
        .then(response => response.data);      

      const productExist = cart.find(product => product.id === productId);      

      if(!productExist && productStock.amount > 0){ 
        const productData = await api.get<Product>(`products/${productId}`)
          .then(response => response.data);
        
        const addNewProduct = [...cart, {...productData, amount: 1}]        
        setCart(addNewProduct);

       localStorage.setItem('@RocketShoes:cart', JSON.stringify(addNewProduct))
      }
      else if(productExist && productExist.amount + 1 <= productStock.amount){
        updateProductAmount({
          productId,
          amount: productExist.amount + 1
        });
      }
      else{
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExists = cart.find(product => product.id === productId); 
            
      if(!productExists){
        toast.error('Erro na remoção do produto');
        return;
      }

      if(productExists){
        const newCart = cart.filter(product => product.id !== productId)
        setCart(newCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }

    } catch {
      toast.error('Erro na remoção do produto')
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const productStock = await api.get<Stock>(`stock/${productId}`)
        .then(response => response.data);
        
      if(amount < 1){
        return;
      }

      else if(amount <= productStock.amount){
        const updateProductCart = cart.map(product => 
          product.id === productId
            ? {...product, amount}
            : product
        )

        setCart(updateProductCart);

        localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateProductCart));
      }
      else{
        toast.error('Quantidade solicitada fora de estoque');        
      }

    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
