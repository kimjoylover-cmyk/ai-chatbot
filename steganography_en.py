from PIL import Image
import numpy as np

def hide_text(cover_path, text, output_path, bits=2, verbose=True):
    cover_img = Image.open(cover_path).convert('RGB')
    cover_array = np.array(cover_img, dtype=np.uint8)
    
    text_bytes = text.encode('utf-8')
    text_length = len(text_bytes)
    
    total_bits_needed = (text_length * 8) + 32
    total_pixels_needed = (total_bits_needed + bits - 1) // bits
    
    available_pixels = cover_array.shape[0] * cover_array.shape[1] * 3
    
    if total_pixels_needed > available_pixels:
        raise ValueError(f"Text is too long. Need {total_pixels_needed} pixels, but image has {available_pixels} pixels")
    
    mask_bits = (1 << bits) - 1
    mask_clear = 0xFF & (~mask_bits)
    
    cover_array = cover_array & mask_clear
    
    bit_stream = []
    length_bits = format(text_length, '032b')
    for bit in length_bits:
        bit_stream.append(int(bit))
    
    for byte in text_bytes:
        byte_bits = format(byte, '08b')
        for bit in byte_bits:
            bit_stream.append(int(bit))
    
    pixel_idx = 0
    
    for row in range(cover_array.shape[0]):
        for col in range(cover_array.shape[1]):
            for channel in range(3):
                if pixel_idx * bits >= len(bit_stream):
                    break
                
                value = 0
                for i in range(bits):
                    bit_pos = pixel_idx * bits + i
                    if bit_pos < len(bit_stream):
                        value |= (bit_stream[bit_pos] << i)
                
                cover_array[row, col, channel] |= value
                pixel_idx += 1
                
                if pixel_idx * bits >= len(bit_stream):
                    break
            if pixel_idx * bits >= len(bit_stream):
                break
        if pixel_idx * bits >= len(bit_stream):
            break
    
    stego_img = Image.fromarray(cover_array.astype(np.uint8), mode='RGB')
    
    try:
        stego_img.save(output_path, format='PNG', compress_level=0)
    except TypeError:
        stego_img.save(output_path, format='PNG', optimize=False)
    
    if verbose:
        print(f"Text hiding complete ({bits} bits): {output_path}")
        print(f"Cover image: {cover_path}")
        print(f"Text length: {text_length} bytes")
        print(f"Image size: {cover_img.size}")


def extract_text(stego_path, bits=2):
    stego_img = Image.open(stego_path).convert('RGB')
    stego_array = np.array(stego_img, dtype=np.uint8)
    
    mask_bits = (1 << bits) - 1
    
    bit_stream = []
    
    for row in range(stego_array.shape[0]):
        for col in range(stego_array.shape[1]):
            for channel in range(3):
                pixel_value = stego_array[row, col, channel]
                extracted_bits = pixel_value & mask_bits
                
                for i in range(bits):
                    bit_stream.append((extracted_bits >> i) & 1)
    
    length_bits = bit_stream[:32]
    text_length = int(''.join(map(str, length_bits)), 2)
    
    total_bits_needed = (text_length * 8) + 32
    
    if total_bits_needed > len(bit_stream):
        return None
    
    data_bits = bit_stream[32:total_bits_needed]
    
    text_bytes = bytearray()
    for i in range(0, len(data_bits), 8):
        if i + 8 <= len(data_bits):
            byte_bits = data_bits[i:i+8]
            byte_value = int(''.join(map(str, byte_bits)), 2)
            text_bytes.append(byte_value)
    
    try:
        text = text_bytes.decode('utf-8')
        return text
    except UnicodeDecodeError:
        return None


if __name__ == "__main__":
    import os
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    cover_path = "test_image.png"
    stego_path = "stego_output.png"
    secret_text = "This is the hidden message"
    
    print(" LSB Text Steganography Test\n")
    
    if not os.path.exists(cover_path):
        print(f"✗ Cover image not found: {cover_path}")
        print(f"Current directory: {os.getcwd()}")
        
        image_files = [f for f in os.listdir('.') if f.lower().endswith(('.png', '.jpg', '.jpeg')) and f != stego_path]
        
        if image_files:
            print(f"\nfound image in folder:")
            for img in image_files:
                print(f"  - {img}")
            cover_path = image_files[0]
            print(f"\ngoing to use this image: {cover_path}")
        else:
            print("\nno image found.")
            
            exit(1)
    
    print(f"Cover image: {cover_path}")
    print(f"Secret text: {secret_text}")
    print(f"Text length: {len(secret_text.encode('utf-8'))} bytes\n")
    
    print("1. Hiding text...")
    try:
        hide_text(cover_path, secret_text, stego_path, bits=2)
        print("✓ Hiding successful!\n")
    except Exception as e:
        print(f"✗ Hiding failed: {e}\n")
        import traceback
        traceback.print_exc()
        exit(1)
    
    print("2. Extracting text...")
    try:
        extracted_text = extract_text(stego_path, bits=2)
        if extracted_text:
            print(f"✓ Extraction successful!")
            print(f"Extracted text: {extracted_text}\n")
            
            if extracted_text == secret_text:
                print("✓✓ Text matches perfectly!")
            else:
                print("✗ Text does not match!")
                print(f"Original: {secret_text}")
                print(f"Extracted: {extracted_text}")
        else:
            print("✗ Failed to decode extracted text\n")
    except Exception as e:
        print(f"✗ Extraction failed: {e}\n")
        import traceback
        traceback.print_exc()
        exit(1)
    
  
    print(f"Cover image: {cover_path}")
    print(f"Stego image: {stego_path}")

